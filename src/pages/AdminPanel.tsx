import React, { useState } from "react";
import { useElectionData } from "../context/ElectionDataContext";
import { Party, DistrictVote } from "../types";
import { Edit2, Trash2, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"parties" | "votes">("parties");
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <h1 className="text-2xl md:text-3xl font-bold text-center text-teal-800 mb-8">
        Admin Panel
        <button
          className="absolute right-4 top-8 flex items-center gap-1 text-gray-500 hover:text-teal-700 transition focus:outline-none"
          title="Settings"
          onClick={() => navigate("/settings")}
        >
          <SettingsIcon size={22} />
          <span className="hidden md:inline text-base font-medium">
            Settings
          </span>
        </button>
      </h1>

      {/* Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium text-sm focus:outline-none ${
            activeTab === "parties"
              ? "text-teal-800 border-b-2 border-teal-800"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("parties")}
        >
          Manage Parties
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm focus:outline-none ${
            activeTab === "votes"
              ? "text-teal-800 border-b-2 border-teal-800"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("votes")}
        >
          Manage Votes
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "parties" ? <ManageParties /> : <ManageVotes />}
    </div>
  );
};

// Manage Parties Component
const ManageParties: React.FC = () => {
  const { districts, parties, addParty, updateParty, deleteParty } =
    useElectionData();
  const [formData, setFormData] = useState<{
    id: string | null;
    name: string;
    logoData?: string;
    districtId: string;
  }>({
    id: null,
    name: "",
    logoData: undefined,
    districtId: "",
  });
  const [votesEdit, setVotesEdit] = useState<{ [partyId: string]: string }>({});
  const [votesEditOpen, setVotesEditOpen] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [partyToDelete, setPartyToDelete] = useState<Party | null>(null);

  // Filter out the 'all-districts' option
  const districtOptions = districts.filter((d) => d.id !== "all-districts");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "votes" ? value : value,
    }));
    setFormError(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const dataUrl = await toBase64(file);
      setFormData((prev) => ({ ...prev, logoData: dataUrl }));
    }
  };

  function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError("Party name is required");
      return false;
    }
    if (!formData.districtId) {
      setFormError("Please select a district");
      return false;
    }
    if (!formData.logoData) {
      setFormError("Party logo is required");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (formData.id) {
      // Update existing party (except votes)
      updateParty({
        id: formData.id,
        name: formData.name,
        logoData: formData.logoData,
        districtId: formData.districtId,
      });
      setFormSuccess("Party updated successfully");
    } else {
      // Add new party (votes start at 0)
      addParty({
        name: formData.name,
        votes: 0,
        logoData: formData.logoData,
        districtId: formData.districtId,
      });
      setFormSuccess("Party added successfully");
    }

    // Reset form
    setFormData({
      id: null,
      name: "",
      logoData: undefined,
      districtId: "",
    });

    // Clear success message after 3 seconds
    setTimeout(() => {
      setFormSuccess(null);
    }, 3000);
  };

  const handleEdit = (party: Party) => {
    setFormData({
      id: party.id,
      name: party.name,
      votes: party.votes.toString(),
      logoData: party.logoData,
      districtId: party.districtId,
    });
    setFormError(null);
  };

  const handleDelete = (party: Party) => {
    setPartyToDelete(party);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (partyToDelete) {
      deleteParty(partyToDelete.id);
      setFormSuccess("Party deleted successfully");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setFormSuccess(null);
      }, 3000);
    }
    setDeleteModalOpen(false);
    setPartyToDelete(null);
  };

  const handleClear = () => {
    setFormData({
      id: null,
      name: "",
      votes: "",
      logoData: undefined,
      districtId: "",
    });
    setFormError(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-2 border-teal-800">
        <h2 className="text-xl font-semibold mb-4">
          {formData.id ? "Edit Party" : "Add Party"}
        </h2>

        {formError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {formError}
          </div>
        )}

        {formSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {formSuccess}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Party Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-800 focus:border-teal-800"
                required
              />
            </div>

            <div>
              <label
                htmlFor="logoData"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Party Logo File
              </label>
              <div className="flex items-center">
                <input
                  type="file"
                  id="logoData"
                  name="logoData"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-800 focus:border-teal-800"
                />
                {formData.logoData && (
                  <img
                    src={formData.logoData}
                    alt="Logo preview"
                    className="w-10 h-10 ml-2 object-contain"
                  />
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="districtId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                District
              </label>
              <select
                id="districtId"
                name="districtId"
                value={formData.districtId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-800 focus:border-teal-800"
                required
              >
                <option value="">Select District</option>
                {districtOptions.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-800 focus:ring-opacity-50"
            >
              {formData.id ? "Update Party" : "Add Party"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="p-4 text-xl font-semibold border-b">Party List</h2>
        <div className="overflow-x-auto">
          {/* Group parties by district */}
          {districts
            .filter((d) => d.id !== "all-districts")
            .map((district) => {
              const districtParties = parties.filter(
                (p) => p.districtId === district.id
              );
              if (districtParties.length === 0) return null;
              return (
                <div key={district.id} className="mb-8">
                  <h3 className="px-6 py-3 text-lg font-bold text-teal-800 bg-gray-50 border-b border-teal-200">
                    {district.name}
                  </h3>
                  <table className="min-w-full divide-y divide-gray-200 border-2 border-teal-800 mb-4">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                          Party Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                          Votes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                          Logo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {districtParties.map((party) => (
                        <tr key={party.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {party.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-700">
                              {party.votes.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <img
                              src={party.logoData}
                              alt={`${party.name} logo`}
                              className="w-8 h-8 object-contain"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleEdit(party)}
                              className="p-2 text-teal-600 hover:text-teal-900 mr-2"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(party)}
                              className="p-2 text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-teal-800">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="mb-4">
              Are you sure you want to delete {partyToDelete?.name}? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Manage Votes Component
const ManageVotes: React.FC = () => {
  const { districts, updateDistrictVotes, deleteDistrictVotes } =
    useElectionData();
  const [formData, setFormData] = useState<{
    districtId: string;
    totalVotes: number | undefined;
    rejectedVotes: number | undefined;
  }>({
    districtId: "",
    totalVotes: undefined,
    rejectedVotes: undefined,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [districtToDelete, setDistrictToDelete] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Filter out the 'all-districts' option
  const districtOptions = districts.filter((d) => d.id !== "all-districts");

  const handleEdit = (district: District) => {
    setFormData({
      districtId: district.id,
      totalVotes: undefined, // no initial value
      rejectedVotes: undefined, // no initial value
    });
    setFormError(null);
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.districtId) return;
    if (formData.totalVotes === undefined || formData.totalVotes < 0) {
      setFormError("Total votes cannot be negative or empty");
      return;
    }
    if (formData.rejectedVotes === undefined || formData.rejectedVotes < 0) {
      setFormError("Rejected votes cannot be negative or empty");
      return;
    }
    if (formData.rejectedVotes > formData.totalVotes) {
      setFormError("Rejected votes cannot exceed total votes");
      return;
    }
    updateDistrictVotes({
      districtId: formData.districtId,
      totalVotes: formData.totalVotes,
      rejectedVotes: formData.rejectedVotes,
    });
    setFormSuccess("Votes updated successfully");
    setEditModalOpen(false);
    setTimeout(() => setFormSuccess(null), 3000);
  };

  const handleDelete = (districtId: string) => {
    setDistrictToDelete(districtId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (districtToDelete) {
      deleteDistrictVotes(districtToDelete);
      setFormSuccess("Votes deleted successfully");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setFormSuccess(null);
      }, 3000);
    }
    setDeleteModalOpen(false);
    setDistrictToDelete(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="p-4 text-xl font-semibold border-b">District Votes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border-2 border-teal-800">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
                >
                  District
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
                >
                  Total Votes
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
                >
                  Rejected Votes
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"
                >
                  Valid Votes
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
              {districtOptions.map((district) => (
                <tr key={district.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {district.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      {district.totalVotes.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      {district.rejectedVotes.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      {district.validVotes.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(district)}
                      className="p-2 text-teal-600 hover:text-teal-900 mr-2"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(district.id)}
                      className="p-2 text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-teal-800">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit District Votes
            </h3>
            {formData.districtId && (
              <div className="mb-2 text-base font-semibold text-teal-700">
                District:{" "}
                {districts.find((d) => d.id === formData.districtId)?.name ||
                  formData.districtId}
              </div>
            )}
            {formError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {formError}
              </div>
            )}
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Votes
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={
                    formData.totalVotes === undefined ? "" : formData.totalVotes
                  }
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      totalVotes:
                        e.target.value === ""
                          ? undefined
                          : parseInt(e.target.value),
                    }))
                  }
                  placeholder="Enter total votes"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejected Votes
                </label>
                <input
                  type="number"
                  min="0"
                  max={formData.totalVotes || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={
                    formData.rejectedVotes === undefined
                      ? ""
                      : formData.rejectedVotes
                  }
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      rejectedVotes:
                        e.target.value === ""
                          ? undefined
                          : parseInt(e.target.value),
                    }))
                  }
                  placeholder="Enter rejected votes"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-teal-800">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="mb-4">
              Are you sure you want to delete votes for{" "}
              {districts.find((d) => d.id === districtToDelete)?.name}? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
