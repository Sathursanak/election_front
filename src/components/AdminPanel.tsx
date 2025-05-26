import React, { useState } from "react";
import { useElectionData } from "../context/ElectionDataContext";
import { Party } from "../types";
import { Edit2, Trash2 } from "lucide-react";

const AdminPanel: React.FC = () => {
  const {
    districts,
    parties,
    selectedDistrictId,
    addParty,
    updateParty,
    deleteParty,
    updateDistrictVotes,
    deleteDistrictVotes,
  } = useElectionData();

  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [partyToDelete, setPartyToDelete] = useState<Party | null>(null);
  const [addVotesModalOpen, setAddVotesModalOpen] = useState(false);

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

  const handleVotesUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDistrict) {
      const form = e.target as HTMLFormElement;
      const totalVotes = parseInt(form.totalVotes.value);
      const rejectedVotes = parseInt(form.rejectedVotes.value);

      updateDistrictVotes({
        districtId: selectedDistrict.id,
        totalVotes,
        rejectedVotes,
      });
    }
  };

  const handleDeleteVotes = () => {
    if (selectedDistrict) {
      deleteDistrictVotes(selectedDistrict.id);
    }
  };

  if (!selectedDistrict) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-teal-800">
        <p className="text-gray-500 text-center">
          Please select a district to manage
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-8 border-2 border-teal-800">
      <h2 className="text-2xl font-semibold text-gray-800">
        Manage {selectedDistrict.name}
      </h2>

      {/* District Votes Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-700">District Votes</h3>
        <form onSubmit={handleVotesUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Total Votes
              </label>
              <input
                type="number"
                name="totalVotes"
                defaultValue={selectedDistrict.totalVotes || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Rejected Votes
              </label>
              <input
                type="number"
                name="rejectedVotes"
                defaultValue={selectedDistrict.rejectedVotes || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleDeleteVotes}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-700 hover:bg-red-800 rounded-md transition-colors"
            >
              Delete Votes
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-md transition-colors"
            >
              Update Votes
            </button>
          </div>
        </form>
      </div>

      {/* Add Votes for Parties Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-700">
          Add Votes for Parties
        </h3>
        <button
          className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          onClick={() => setAddVotesModalOpen(true)}
        >
          Add Votes
        </button>
        {addVotesModalOpen && (
          <AddVotesForPartyModal
            parties={parties}
            selectedDistrict={selectedDistrict}
            updateParty={updateParty}
            onClose={() => setAddVotesModalOpen(false)}
          />
        )}
      </div>

      {/* Edit Party Modal */}
      {editingParty && (
        <div className="fixed inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md border-2 border-teal-800">
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
                      setEditingParty({ ...editingParty, name: e.target.value })
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
                    value={editingParty.votes === 0 ? "" : editingParty.votes}
                    onChange={(e) =>
                      setEditingParty({
                        ...editingParty,
                        votes:
                          e.target.value === "" ? 0 : parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    placeholder="Enter vote count"
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
                        setEditingParty({ ...editingParty, logoData: dataUrl });
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
        <div className="fixed inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md border-2 border-teal-800">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Delete Party
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {partyToDelete?.name}? This action
              cannot be undone.
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

      {/* Party List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-700">Manage Parties</h3>
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parties
                .filter((party) => party.districtId === selectedDistrict.id)
                .map((party) => (
                  <tr
                    key={party.id}
                    className="hover:bg-gray-50 transition-colors"
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
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(party)}
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                          title="Edit party"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(party)}
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
      </div>
    </div>
  );
};

// AddVotesForPartyModal: Modal to add votes for a party in the selected district
const AddVotesForPartyModal: React.FC<{
  parties: Party[];
  selectedDistrict: any;
  updateParty: (party: Party) => void;
  onClose: () => void;
}> = ({ parties, selectedDistrict, updateParty, onClose }) => {
  const [selectedPartyId, setSelectedPartyId] = useState("");
  const [votes, setVotes] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Only show parties in the current district
  const districtParties = selectedDistrict
    ? parties.filter((p) => p.districtId === selectedDistrict.id)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!selectedPartyId) {
      setError("Please select a party");
      return;
    }
    if (votes === "" || isNaN(Number(votes)) || Number(votes) < 0) {
      setError("Please enter a valid vote count");
      return;
    }
    const party = districtParties.find((p) => p.id === selectedPartyId);
    if (!party) {
      setError("Party not found");
      return;
    }
    updateParty({ ...party, votes: Number(votes) });
    setSuccess("Votes updated for " + party.name);
    setVotes("");
    setSelectedPartyId("");
    setTimeout(() => {
      setSuccess("");
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md border-2 border-teal-800">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Add Votes for Party
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Party
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded"
              value={selectedPartyId}
              onChange={(e) => setSelectedPartyId(e.target.value)}
              required
            >
              <option value="">Select Party</option>
              {districtParties.map((party) => (
                <option key={party.id} value={party.id}>
                  {party.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Votes
            </label>
            <input
              type="number"
              min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="Votes"
              value={votes}
              onChange={(e) => setVotes(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors"
            >
              Add/Update Votes
            </button>
          </div>
          {success && (
            <div className="text-green-600 text-sm mt-2">{success}</div>
          )}
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
