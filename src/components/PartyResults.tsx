import React, { useState } from "react";
import { Party } from "../types";
import { useElectionData } from "../context/ElectionDataContext";
import { Edit2, Trash2 } from "lucide-react";
import ElectionCharts from "./ElectionCharts";

interface PartyResultsProps {
  parties: Party[];
}

const PartyResults: React.FC<PartyResultsProps> = ({ parties }) => {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const { selectedDistrictId, updateParty, deleteParty, districts } =
    useElectionData();
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [partyToDelete, setPartyToDelete] = useState<Party | null>(null);

  // Always show all registered parties for the selected district, even if votes are 0
  let filteredParties: Party[] = [];
  if (selectedDistrictId === "all-districts") {
    filteredParties = parties;
  } else {
    filteredParties = parties.filter(
      (party) => party.districtId === selectedDistrictId
    );
  }

  const sortedParties = [...filteredParties].sort((a, b) => b.votes - a.votes);

  const selectedDistrict = districts.find((d) => d.id === selectedDistrictId);

  const handleEdit = (party: Party) => {
    setEditingParty({ ...party });
  };

  const handleDelete = (party: Party) => {
    setPartyToDelete(party);
    setDeleteModalOpen(true);
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  return (
    <div className="space-y-6">
      {/* Results Table/Cards Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-teal-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {selectedDistrictId === "all-districts"
              ? "All Party Results"
              : "District Party Results"}
          </h2>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === "cards"
                  ? "bg-teal-600 text-white font-semibold"
                  : " text-gray-600 hover:bg-gray-100 font-medium"
              }`}
              onClick={() => setViewMode("cards")}
            >
              Cards
            </button>
            <button
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === "table"
                  ? "bg-teal-600 text-white font-semibold"
                  : " text-gray-600 hover:bg-gray-100 font-medium"
              }`}
              onClick={() => setViewMode("table")}
            >
              Table
            </button>
          </div>
        </div>

        {sortedParties.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No parties found for this district
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedParties.map((party) => (
              <PartyCard
                key={party.id}
                party={party}
                // Remove edit/delete for cards
                onEdit={undefined}
                onDelete={undefined}
              />
            ))}
          </div>
        ) : (
          <PartyTable
            parties={sortedParties}
            // Remove edit/delete for table
            onEdit={undefined}
            onDelete={undefined}
            selectedDistrict={selectedDistrict}
          />
        )}
      </div>

      {/* Charts Section */}
      {selectedDistrict && (
        <ElectionCharts
          parties={filteredParties}
          districtName={selectedDistrict.name}
        />
      )}
    </div>
  );
};

interface PartyCardProps {
  party: Party;
  onEdit?: () => void;
  onDelete?: () => void;
}

const PartyCard: React.FC<PartyCardProps> = ({ party }) => {
  // Determine if this party is the bonus seat party (highest votes in its district)
  // We'll use the same logic as the table: highest votes among all parties in the same district
  const { parties } = useElectionData();
  const districtParties = parties.filter(
    (p) => p.districtId === party.districtId
  );
  const maxVotes = Math.max(...districtParties.map((p) => p.votes));
  const isBonusSeat = party.votes === maxVotes && maxVotes > 0;
  return (
    <div
      className={`border border-black rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <img
              src={party.logoData}
              alt={`${party.name} logo`}
              className="w-12 h-12 object-contain"
            />
            <div>
              <h3 className="font-semibold text-gray-800">{party.name}</h3>
              {isBonusSeat && (
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                  Bonus Seat
                </span>
              )}
            </div>
          </div>
          {/* Removed edit/delete buttons from cards */}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Votes:</span>
            <span className="font-medium">{party.votes.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Percentage:</span>
            <span className="font-medium">{party.percentage?.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Seats:</span>
            <span className="font-medium">{party.seats}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PartyTableProps {
  parties: Party[];
  onEdit?: (party: Party) => void;
  onDelete?: (party: Party) => void;
  selectedDistrict?: any;
}

const PartyTable: React.FC<PartyTableProps> = ({ parties }) => {
  // Check if all parties have votes > 0
  const allHaveVotes = parties.length > 0 && parties.every((p) => p.votes > 0);

  // Find the bonus seat party id for the current district (if any)
  const maxVotes = Math.max(...parties.map((p) => p.votes));
  const bonusSeatPartyIds = parties
    .filter((p) => p.votes === maxVotes && maxVotes > 0)
    .map((p) => p.id);
  // Qualification logic: party must have >= 5% of total valid votes in the district
  const totalValidVotes = parties.reduce((sum, p) => sum + p.votes, 0);
  const minVotesToQualify = Math.floor(totalValidVotes * 0.05);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
            >
              Party
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
            >
              Votes
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
            >
              Percentage
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
            >
              Seats
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
            >
              Bonus Seat
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {parties.map((party) => {
            const qualified = party.votes >= minVotesToQualify;
            const isBonusSeat = bonusSeatPartyIds.includes(party.id);
            return (
              <tr
                key={party.id}
                className={`hover:bg-gray-50 transition-colors ${
                  isBonusSeat ? "bg-green-50" : ""
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <img
                      src={party.logoData}
                      alt={`${party.name} logo`}
                      className="w-8 h-8 object-contain"
                    />
                    <div className="font-medium text-gray-900">
                      {party.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {party.votes.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {allHaveVotes ? (
                    qualified ? (
                      <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Qualified
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Disqualified
                      </span>
                    )
                  ) : (
                    <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Active Counting
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {allHaveVotes ? `${party.percentage?.toFixed(1) ?? 0}%` : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {allHaveVotes ? party.seats : "Active Counting"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {allHaveVotes ? (
                    isBonusSeat ? (
                      <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Yes
                      </span>
                    ) : (
                      <span className="text-gray-700">No</span>
                    )
                  ) : (
                    <span className="text-gray-700">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PartyResults;
