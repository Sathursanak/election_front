import React, { useEffect, useState } from "react";
import { useElectionData } from "../context/ElectionDataContext";
import DistrictNavigation from "../components/DistrictNavigation";
import SummaryTable from "../components/SummaryTable";
import PartyResults from "../components/PartyResults";
import { X } from "lucide-react";

interface PartyFormData {
  name: string;
  votes: string;
  logoData?: string;
}

const Results: React.FC = () => {
  const {
    districts,
    parties,
    selectedDistrictId,
    setSelectedDistrictId,
    addParty,
    updateDistrictVotes,
  } = useElectionData();

  const [showPartyForm, setShowPartyForm] = useState(false);
  const [partyFormData, setPartyFormData] = useState<PartyFormData>({
    name: "",
    votes: "",
    logoData: undefined,
  });
  const [partyFormError, setPartyFormError] = useState<string | null>(null);
  const [voteFormData, setVoteFormData] = useState({
    totalVotes: 0,
    rejectedVotes: 0,
  });
  const [voteFormError, setVoteFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Set default district if none selected
  useEffect(() => {
    if (!selectedDistrictId) {
      setSelectedDistrictId("colombo");
    }
  }, [selectedDistrictId, setSelectedDistrictId]);

  // Update vote form data when district changes
  useEffect(() => {
    const district = districts.find((d) => d.id === selectedDistrictId);
    if (district) {
      setVoteFormData({
        totalVotes: district.totalVotes,
        rejectedVotes: district.rejectedVotes,
      });
    }
  }, [selectedDistrictId, districts]);

  const selectedDistrict =
    districts.find((d) => d.id === selectedDistrictId) || districts[0];
  const selectedParties = parties.filter(
    (p) => p.districtId === selectedDistrictId
  );

  const handlePartySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPartyFormError(null);

    if (!partyFormData.name.trim()) {
      setPartyFormError("Party name is required");
      return;
    }
    if (!partyFormData.logoData) {
      setPartyFormError("Party logo is required");
      return;
    }
    const votesNumber = parseInt(partyFormData.votes, 10) || 0;
    if (votesNumber < 0) {
      setPartyFormError("Votes cannot be negative");
      return;
    }

    try {
      addParty({
        name: partyFormData.name,
        votes: votesNumber,
        logoData: partyFormData.logoData,
        districtId: selectedDistrictId,
      });

      setSuccessMessage("Party added successfully");
      setShowPartyForm(false);
      setPartyFormData({
        name: "",
        votes: "",
        logoData: undefined,
      });

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch {
      setPartyFormError("Failed to add party");
    }
  };

  const handleVoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVoteFormError(null);

    if (voteFormData.totalVotes < 0) {
      setVoteFormError("Total votes cannot be negative");
      return;
    }

    if (voteFormData.rejectedVotes < 0) {
      setVoteFormError("Rejected votes cannot be negative");
      return;
    }

    if (voteFormData.rejectedVotes > voteFormData.totalVotes) {
      setVoteFormError("Rejected votes cannot exceed total votes");
      return;
    }

    try {
      updateDistrictVotes({
        districtId: selectedDistrictId,
        totalVotes: voteFormData.totalVotes,
        rejectedVotes: voteFormData.rejectedVotes,
      });

      setSuccessMessage("Votes updated successfully");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch {
      setVoteFormError("Failed to update votes");
    }
  };

  const handleLogoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const dataUrl = await toBase64(file);
      setPartyFormData((prev) => ({ ...prev, logoData: dataUrl }));
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Column - Navigation */}
      <DistrictNavigation className="w-64 flex-shrink-0" />

      {/* Middle Column - Results */}
      <div className="flex-1 p-6 border-l border-r border-gray-200">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {selectedDistrict.name} District Results
          </h1>
          <p className="text-gray-600">Parliamentary Election 2025</p>
        </header>

        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}

        {/* District Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Seats</h3>
            <p className="text-2xl font-bold text-gray-900">
              {selectedDistrict.seats}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Valid Votes</h3>
            <p className="text-2xl font-bold text-gray-900">
              {selectedDistrict.validVotes.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">
              Bonus Seat Party
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {parties.find((p) => p.id === selectedDistrict.bonusSeatPartyId)
                ?.name || "Not Assigned"}
            </p>
          </div>
        </div>

        {/* Summary Table */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            District Summary
          </h2>
          <SummaryTable district={selectedDistrict} parties={parties} />
        </div>

        {/* Party Results */}
        <div className="mb-8">
          <PartyResults parties={selectedParties} />
        </div>
      </div>

      {/* Right Column - Admin Controls */}
      <div className="w-64 p-6 bg-white border-l border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Admin Controls
        </h2>

        {/* Vote Management */}
        <form onSubmit={handleVoteSubmit} className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Update Votes
          </h3>

          {voteFormError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {voteFormError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Total Votes
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={voteFormData.totalVotes}
                onChange={(e) =>
                  setVoteFormData((prev) => ({
                    ...prev,
                    totalVotes: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Rejected Votes
              </label>
              <input
                type="number"
                min="0"
                max={voteFormData.totalVotes}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={voteFormData.rejectedVotes}
                onChange={(e) =>
                  setVoteFormData((prev) => ({
                    ...prev,
                    rejectedVotes: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Update Votes
            </button>
          </div>
        </form>

        {/* Party Management */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Parties</h3>
          <button
            onClick={() => setShowPartyForm(true)}
            className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            Add New Party
          </button>
        </div>
      </div>

      {/* Party Form Modal */}
      {showPartyForm && (
        <div className="fixed inset-0 bg-teal bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Add New Party
              </h3>
              <button
                onClick={() => setShowPartyForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {partyFormError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {partyFormError}
              </div>
            )}

            <form onSubmit={handlePartySubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Party Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={partyFormData.name}
                    onChange={(e) =>
                      setPartyFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Votes
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={partyFormData.votes}
                    onChange={(e) =>
                      setPartyFormData((prev) => ({
                        ...prev,
                        votes: e.target.value,
                      }))
                    }
                    placeholder="Enter vote count"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo File
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      required
                    />
                    {partyFormData.logoData && (
                      <img
                        src={partyFormData.logoData}
                        alt="Logo preview"
                        className="w-10 h-10 object-contain border border-gray-200 rounded"
                      />
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPartyForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                  >
                    Add Party
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
