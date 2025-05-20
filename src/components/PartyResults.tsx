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

  // Filter parties based on selected district
  const filteredParties =
    selectedDistrictId === "all-districts"
      ? parties
      : parties.filter((party) => party.districtId === selectedDistrictId);

  const sortedParties = [...filteredParties].sort((a, b) => b.votes - a.votes);

  const selectedDistrict = districts.find((d) => d.id === selectedDistrictId);

  const handleEdit = (party: Party) => {
    setEditingParty({ ...party });
  };

  const handleDelete = (party: Party) => {
    setPartyToDelete(party);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (partyToDelete) {
      deleteParty(partyToDelete.id);
      setDeleteModalOpen(false);
      setPartyToDelete(null);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingParty) {
      updateParty({
        ...editingParty,
        votes: Number(editingParty.votes),
      });
      setEditingParty(null);
    }
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
      <div className="bg-white rounded-lg shadow-md p-6">
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
                  ? "bg-gray-100 text-gray-800 font-semibold"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setViewMode("cards")}
            >
              Cards
            </button>
            <button
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === "table"
                  ? "bg-gray-100 text-gray-800 font-semibold"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
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
                onEdit={() => handleEdit(party)}
                onDelete={() => handleDelete(party)}
              />
            ))}
          </div>
        ) : (
          <PartyTable
            parties={sortedParties}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Edit Modal */}
        {editingParty && (
          <div className="fixed inset-0 bg-teal bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Edit Party
              </h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Party Name
                    </label>
                    <input
                      type="text"
                      value={editingParty.name}
                      onChange={(e) =>
                        setEditingParty({
                          ...editingParty,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Votes
                    </label>
                    <input
                      type="number"
                      value={editingParty.votes}
                      onChange={(e) =>
                        setEditingParty({
                          ...editingParty,
                          votes: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Logo File
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const dataUrl = await toBase64(file);
                          setEditingParty({
                            ...editingParty,
                            logoData: dataUrl,
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    />
                    {editingParty.logoData && (
                      <img
                        src={editingParty.logoData}
                        alt="Logo preview"
                        className="w-10 h-10 object-contain border border-gray-200 rounded"
                      />
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditingParty(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-md transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-teal bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Delete Party
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {partyToDelete?.name}? This
                action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-700 hover:bg-red-800 rounded-md transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
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
  onEdit: () => void;
  onDelete: () => void;
}

const PartyCard: React.FC<PartyCardProps> = ({ party, onEdit, onDelete }) => {
  return (
    <div
      className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all ${
        party.hasBonusSeat ? "border-green-500" : "border-gray-200"
      }`}
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
              {party.hasBonusSeat && (
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                  Bonus Seat
                </span>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
              title="Edit party"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-red-700 hover:text-red-800 transition-colors"
              title="Delete party"
            >
              <Trash2 size={16} />
            </button>
          </div>
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
  onEdit: (party: Party) => void;
  onDelete: (party: Party) => void;
}

const PartyTable: React.FC<PartyTableProps> = ({
  parties,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Party
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Votes
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Percentage
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Seats
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Bonus Seat
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {parties.map((party) => (
            <tr
              key={party.id}
              className={`hover:bg-gray-50 transition-colors ${
                party.hasBonusSeat ? "bg-green-50" : ""
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <img
                    src={party.logoData}
                    alt={`${party.name} logo`}
                    className="w-8 h-8 object-contain"
                  />
                  <div className="font-medium text-gray-900">{party.name}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {party.votes.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {party.percentage?.toFixed(1)}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {party.seats}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {party.hasBonusSeat ? (
                  <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Yes
                  </span>
                ) : (
                  <span className="text-gray-500">No</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(party)}
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                    title="Edit party"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(party)}
                    className="text-red-700 hover:text-red-800 transition-colors"
                    title="Delete party"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PartyResults;
