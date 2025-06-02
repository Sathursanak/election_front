// --- Custom Calculation Logic ---
interface PartyWithResults extends Party {
  qualified?: boolean;
  firstRoundSeats?: number;
  secondRoundSeats?: number;
  totalSeats?: number;
  remainder?: number;
  hasBonusSeat?: boolean;
  percentage?: number;
}

function calculateDistrictResults(
  parties: Party[],
  totalVotes: number,
  seats: number
) {
  // 1. 5% Disqualified votes
  const disqualifiedVotes = totalVotes * 0.05;
  // 2. Total valid votes
  const totalValidVotes = totalVotes - disqualifiedVotes;
  // 3. Qualified parties
  const qualifiedParties = parties.filter((p) => p.votes > disqualifiedVotes);
  // 4. Votes per seat
  const votesPerSeat = totalValidVotes / seats;

  // 5. 1st round seat allocation
  let seatAllocations: PartyWithResults[] = qualifiedParties.map((p) => ({
    ...p,
    qualified: true,
    percentage: totalValidVotes > 0 ? (p.votes / totalValidVotes) * 100 : 0,
    firstRoundSeats: Math.floor(p.votes / votesPerSeat),
    remainder: p.votes % votesPerSeat,
    hasBonusSeat: false,
    secondRoundSeats: 0,
    totalSeats: 0,
  }));

  // 6. Bonus seat
  let maxVotes = Math.max(...seatAllocations.map((p) => p.votes));
  let bonusParty = seatAllocations.find((p) => p.votes === maxVotes);
  if (bonusParty) bonusParty.hasBonusSeat = true;

  // 7. Remaining seats for 2nd round
  const totalFirstRoundSeats = seatAllocations.reduce(
    (sum: number, p: PartyWithResults) => sum + (p.firstRoundSeats || 0),
    0
  );
  let remainingSeats = seats - totalFirstRoundSeats - 1; // -1 for bonus seat
  if (remainingSeats < 0) remainingSeats = 0;

  // 8. 2nd round: assign by highest remainder
  let sortedByRemainder = [...seatAllocations].sort(
    (a, b) => (b.remainder || 0) - (a.remainder || 0)
  );
  for (let i = 0; i < remainingSeats; i++) {
    if (sortedByRemainder[i]) {
      sortedByRemainder[i].secondRoundSeats =
        (sortedByRemainder[i].secondRoundSeats || 0) + 1;
    }
  }

  // 9. Total seats
  seatAllocations = seatAllocations.map((p) => ({
    ...p,
    totalSeats:
      (p.firstRoundSeats || 0) + (p.secondRoundSeats || 0) + (p.hasBonusSeat ? 1 : 0),
  }));

  // 10. Mark disqualified parties
  const allParties: PartyWithResults[] = parties.map((p) => {
    const found = seatAllocations.find((q) => q.id === p.id);
    if (found) return found;
    return {
      ...p,
      qualified: false,
      percentage: totalValidVotes > 0 ? (p.votes / totalValidVotes) * 100 : 0,
      firstRoundSeats: 0,
      secondRoundSeats: 0,
      hasBonusSeat: false,
      totalSeats: 0,
    };
  });

  return {
    disqualifiedVotes,
    totalValidVotes,
    votesPerSeat,
    seatAllocations: allParties,
    bonusPartyId: bonusParty ? bonusParty.id : null,
  };
}
import React, { useState, useEffect } from "react";
import { useElectionData } from "../context/ElectionDataContext";
import DistrictNavigation from "../components/DistrictNavigation";
import SriLankaMap from "../components/SriLankaMap";
import ElectionPieCharts from "../components/ElectionPieCharts";
import SummaryTable from "../components/SummaryTable";
import { allocateSeats, Party } from "../utils/seatAllocation";
import DistrictResultsCharts from "../components/DistrictResultsCharts";

const ElectionProcess: React.FC = () => {
  // --- Election Data Context ---
  const {
    year,
    districts,
    parties,
    selectedDistrictId,
    setSelectedDistrictId,
    districtNominations,
    electionStats,
    updateDistrictVotes,
    updatePartyVotes,
    calculatedResults,
    setCalculatedResults,
    setParties,
  } = useElectionData();

  // --- UI State ---
  const userType = localStorage.getItem("userType");

  // Removed unused addVotes state
  const [voteFormData, setVoteFormData] = useState({
    totalVotes: 0,
    rejectedVotes: 0,
  });
  const [voteFormError, setVoteFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- Derived Data ---
  const isIslandWide = selectedDistrictId === "all-districts";
  let selectedDistrict = districts.find((d) => d.id === selectedDistrictId);
  const assignedPartyIds = districtNominations[selectedDistrictId] || [];
  const getPartyById = (id: string) => parties.find((p) => p.id === id);

  let selectedPartiesRaw = assignedPartyIds.map((partyId) => {
    const party = parties.find(
      (p) => p.id === partyId && p.districtId === selectedDistrictId
    );
    if (party) return party;
    const anyParty = getPartyById(partyId);
    return {
      id: partyId,
      name: anyParty ? anyParty.name : partyId,
      votes: 0,
      logoData: anyParty ? anyParty.logoData : undefined,
      districtId: selectedDistrictId,
      percentage: 0,
      seats: 0,
      hasBonusSeat: false,
    };
  });

  let selectedParties = selectedPartiesRaw;
  let islandWideStats = null;

  if (isIslandWide) {
    const allAssignedPartyIds = new Set(
      Object.values(districtNominations).flat()
    );
    const partyMap: Record<string, Party & { districts: Set<string> }> = {};
    parties.forEach((p) => {
      if (!allAssignedPartyIds.has(p.id)) return;
      const key = p.name.trim().toLowerCase();
      if (!partyMap[key]) {
        partyMap[key] = { ...p, votes: 0, seats: 0, districts: new Set() };
      }
      partyMap[key].votes += p.votes;
      partyMap[key].seats += p.seats || 0;
      partyMap[key].districts.add(p.districtId);
    });
    const allSeats = electionStats.totalSeats;
    const allParties = Object.values(partyMap).map((p) => ({
      ...p,
      districts: Array.from(p.districts),
    }));
    const allocated = allocateSeats(allParties, allSeats);
    selectedParties = allocated;
    selectedPartiesRaw = allParties;
    const totalValidVotes = districts
      .filter((d) => d.id !== "all-districts")
      .reduce((sum, d) => sum + d.validVotes, 0);
    selectedDistrict = {
      id: "all-districts",
      name: "Island-wide",
      seats: allSeats,
      validVotes: totalValidVotes,
      totalVotes: allParties.reduce((sum, p) => sum + p.votes, 0),
      rejectedVotes: 0,
      province: "All",
      bonusSeats: 0,
      bonusSeatPartyId: null,
    };
    islandWideStats = {
      leadingParty: allocated.reduce(
        (prev, curr) => (curr.votes > prev.votes ? curr : prev),
        allocated[0]
      ),
      totalVotes: allParties.reduce((sum, p) => sum + p.votes, 0),
      totalSeats: allSeats,
    };
  } else {
    selectedDistrict =
      districts.find((d) => d.id === selectedDistrictId) || districts[0];
    selectedPartiesRaw = parties.filter(
      (p) =>
        p.districtId === selectedDistrictId && assignedPartyIds.includes(p.id)
    );
    selectedParties = allocateSeats(selectedPartiesRaw, selectedDistrict.seats);
  }

  const districtParties = !isIslandWide
    ? assignedPartyIds.map((partyId) => {
        // Always use the full party object from parties, fallback to getPartyById
        const party = parties.find(
          (p) => p.id === partyId && p.districtId === selectedDistrictId
        );
        if (party) return { ...party };
        const anyParty = getPartyById(partyId);
        return {
          id: partyId,
          name: anyParty ? anyParty.name : partyId,
          votes: 0,
          logoData: anyParty ? anyParty.logoData : undefined,
          districtId: selectedDistrictId,
          percentage: 0,
          seats: 0,
          hasBonusSeat: false,
        };
      })
    : [];

  // --- Editable Party Votes State and Logic ---
  const [localDistrictParties, setLocalDistrictParties] = useState<Party[]>([]);
  const [calculationDone, setCalculationDone] = useState(false);
  const [partyVotesError, setPartyVotesError] = useState<string | null>(null);
  const [partyVotesSuccess, setPartyVotesSuccess] = useState<string | null>(null);
  // Store calculated results after calculation
  const [calculatedParties, setCalculatedParties] = useState<Party[]>([]);
  // Store bonus seat party name after calculation
  const [bonusSeatPartyName, setBonusSeatPartyName] = useState<string | null>(null);

  useEffect(() => {
    if (!isIslandWide && districtParties.length > 0) {
      // Initialize local district parties with district-specific votes
      setLocalDistrictParties(districtParties.map(party => ({
        ...party,
        votes: party.votes || 0 // Ensure we start with the correct district-specific votes
      })));
      setCalculationDone(false);
      setPartyVotesError(null);
      setPartyVotesSuccess(null);
      setCalculatedParties([]);
    }
  }, [selectedDistrictId, districts, parties]);

  const handlePartyVotesChange = (partyId: string, value: string) => {
    // Remove leading zeros and convert to number
    const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, '') || '0');
    
    setLocalDistrictParties(prev =>
      prev.map(p =>
        p.id === partyId ? { ...p, votes: numericValue } : p
      )
    );
    setCalculationDone(false);
    setPartyVotesError(null);
    setPartyVotesSuccess(null);
  };

  const handleCalculateAndSaveVotes = async () => {
    setPartyVotesError(null);
    setPartyVotesSuccess(null);
    const totalPartyVotes = localDistrictParties.reduce(
      (sum, p) => sum + (p.votes || 0),
      0
    );

    if (localDistrictParties.some((p) => p.votes < 0 || isNaN(p.votes))) {
      setPartyVotesError("Votes must be non-negative numbers for all parties.");
      return;
    }

    if (!selectedDistrict) {
      setPartyVotesError("No district selected.");
      return;
    }

    const validVotes = selectedDistrict.totalVotes - selectedDistrict.rejectedVotes;
    
    if (totalPartyVotes !== validVotes) {
      setPartyVotesError(
        `Sum of party votes (${totalPartyVotes}) must exactly equal valid votes (${validVotes}).`
      );
      return;
    }

    try {
      // Update each party's votes for this specific district only
      for (const party of localDistrictParties) {
        await updatePartyVotes(party.id, selectedDistrictId, party.votes);
      }

      // Calculate results for this district only
      const result = calculateDistrictResults(
        localDistrictParties,
        selectedDistrict.totalVotes,
        selectedDistrict.seats
      );

      // Store calculated results in context
      setCalculatedResults(selectedDistrictId, result.seatAllocations);
      setCalculatedParties(result.seatAllocations);
      setCalculationDone(true);
      setPartyVotesSuccess("Votes saved and seats calculated for this district.");

      // Set bonus seat party name for this district
      if (result.bonusPartyId) {
        const bonusParty = result.seatAllocations.find(
          (p) => p.id === result.bonusPartyId
        );
        setBonusSeatPartyName(bonusParty ? bonusParty.name : null);
      } else {
        setBonusSeatPartyName(null);
      }
    } catch (error) {
      setPartyVotesError("Failed to save party votes.");
    }
  };

  // Load calculated results when district changes
  useEffect(() => {
    if (!isIslandWide && calculatedResults[selectedDistrictId]) {
      setCalculatedParties(calculatedResults[selectedDistrictId]);
      setCalculationDone(true);
    } else {
      setCalculatedParties([]);
      setCalculationDone(false);
    }
  }, [selectedDistrictId, calculatedResults]);

  const calculateBonusSeatParty = (districtId: string) => {
    if (isIslandWide) return null;

    // Get parties for this district from the results
    const districtParties = calculationDone 
      ? calculatedParties 
      : localDistrictParties;

    if (districtParties.length === 0) return null;
    
    // Find the party with the highest votes
    const highestVotesParty = districtParties.reduce((prev, curr) =>
      (curr.votes || 0) > (prev.votes || 0) ? curr : prev
    );
    
    // Update the district's bonusSeatPartyId
    if (selectedDistrict && highestVotesParty) {
      selectedDistrict.bonusSeatPartyId = highestVotesParty.id;
    }
    
    return highestVotesParty;
  };

  // Update bonus seat party when district changes or votes are updated
  useEffect(() => {
    if (!isIslandWide) {
      const bonusParty = calculateBonusSeatParty(selectedDistrictId);
      if (bonusParty) {
        setBonusSeatPartyName(bonusParty.name);
      }
    }
  }, [selectedDistrictId, localDistrictParties, calculatedParties]);

  const handleVoteFormChange = (field: 'totalVotes' | 'rejectedVotes', value: string) => {
    // Remove leading zeros and convert to number
    const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, '') || '0');
    
    setVoteFormData(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVoteFormError(null);
    setSuccessMessage(null);
    if (voteFormData.rejectedVotes > voteFormData.totalVotes) {
      setVoteFormError("Rejected votes cannot exceed total votes");
      return;
    }
    try {
      await updateDistrictVotes({
        districtId: selectedDistrictId,
        totalVotes: voteFormData.totalVotes,
        rejectedVotes: voteFormData.rejectedVotes,
      });
      setSuccessMessage("Votes updated successfully");
    } catch {
      setVoteFormError("Failed to update votes");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Column - Navigation */}
      <DistrictNavigation className="w-64 flex-shrink-0" showIslandWideOption />

      {/* Middle Column - Results */}
      <div className="flex-1 p-6 border-l border-r border-gray-200">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {isIslandWide
              ? "Island-wide Results"
              : `${selectedDistrict.name} District Results`}
          </h1>
          <p className="text-gray-600">Parliamentary Election {year}</p>
        </header>

        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-teal-800">
            <h3 className="text-sm font-medium text-gray-500">Total Seats</h3>
            <p className="text-2xl font-bold text-gray-900">
              {selectedDistrict.seats}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-teal-800">
            <h3 className="text-sm font-medium text-gray-500">Valid Votes</h3>
            <p className="text-2xl font-bold text-gray-900">
              {selectedDistrict.validVotes.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-teal-800">
            <h3 className="text-sm font-medium text-gray-500">
              {isIslandWide ? "Leading Party" : "Bonus Seat Party"}
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {isIslandWide
                ? islandWideStats?.leadingParty?.name || "Not Assigned"
                : calculationDone
                ? bonusSeatPartyName || "Not Assigned"
                : (() => {
                    const bonusParty = calculateBonusSeatParty(selectedDistrictId);
                    return bonusParty ? bonusParty.name : "Not Assigned";
                  })()}
            </p>
          </div>
        </div>

        {/* Election Pie Charts for Island-wide view, hide summary and party results */}
        {isIslandWide ? (
          <>
            <SriLankaMap />
            <ElectionPieCharts
              parties={selectedParties}
              districts={districts}
              allParties={parties}
            />
          </>
        ) : (
          <>
            {/* Summary Table */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                District Summary
              </h2>
              <SummaryTable district={selectedDistrict} parties={parties} />
            </div>
            {/* District Party Results - Always show assigned parties as a table */}
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border-2 border-teal-800">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                  District Party Results
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                          Party
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                          Votes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                          Percentage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                          1st Round
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                          2nd Round
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                          Total Seats
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {districtParties.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center py-8 text-gray-500"
                          >
                            No parties assigned to this district
                          </td>
                        </tr>
                      ) : (
                        (calculationDone
                          ? calculatedParties
                          : localDistrictParties
                        ).map((party, idx) => {
                          // If calculationDone, use calculatedParties' values, else fallback to localDistrictParties
                          let percentage = 0;
                          let status = "Active Counting";
                          let firstRoundSeats = 0;
                          let secondRoundSeats = 0;
                          let totalSeats = 0;
                          let votes = party.votes;
                          if (calculationDone) {
                            // Defensive: fallback to 0 if undefined
                            percentage =
                              typeof party.percentage === "number"
                                ? party.percentage
                                : 0;
                            status =
                              party.qualified === false
                                ? "Disqualified"
                                : "Qualified";
                            firstRoundSeats =
                              typeof party.firstRoundSeats === "number"
                                ? party.firstRoundSeats
                                : 0;
                            secondRoundSeats =
                              typeof party.secondRoundSeats === "number"
                                ? party.secondRoundSeats
                                : 0;
                            totalSeats =
                              typeof party.totalSeats === "number"
                                ? party.totalSeats
                                : 0;
                            votes =
                              typeof party.votes === "number" ? party.votes : 0;
                          } else {
                            percentage =
                              selectedDistrict &&
                              selectedDistrict.totalVotes > 0
                                ? (party.votes /
                                    (selectedDistrict.totalVotes -
                                      selectedDistrict.totalVotes * 0.05)) *
                                  100
                                : 0;
                          }
                          return (
                            <tr key={party.id || idx}>
                              <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-3">
                                <img
                                  src={party.logoData}
                                  alt={party.name}
                                  className="w-8 h-8 object-contain"
                                />
                                <span className="font-medium text-gray-900">
                                  {party.name}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {calculationDone ? (
                                  votes
                                ) : (
                                  <input
                                    type="number"
                                    min={0}
                                    className="w-24 px-2 py-1 border border-gray-300 rounded"
                                    value={party.votes === 0 ? '' : party.votes}
                                    disabled={calculationDone}
                                    onChange={(e) =>
                                      handlePartyVotesChange(
                                        party.id,
                                        e.target.value
                                      )
                                    }
                                  />
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {status}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {percentage.toFixed(1)}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {firstRoundSeats}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {secondRoundSeats}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {totalSeats}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Error/Success and Save Button */}
                {partyVotesError && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {partyVotesError}
                  </div>
                )}
                {partyVotesSuccess && (
                  <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
                    {partyVotesSuccess}
                  </div>
                )}
                <button
                  className={`mt-6 px-6 py-2 rounded bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-60`}
                  onClick={handleCalculateAndSaveVotes}
                  disabled={
                    calculationDone || localDistrictParties.length === 0
                  }
                  type="button"
                >
                  Save & Calculate
                </button>

                {/* Add Charts when calculation is done */}
                {calculationDone && calculatedParties.length > 0 && (
                  <DistrictResultsCharts
                    parties={calculatedParties}
                    districtName={selectedDistrict.name}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Column - Admin Controls */}
      {userType === "admin" && !isIslandWide && (
        <div className="w-64 p-6 bg-white border-l border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Admin Controls
          </h2>

          {/* Vote Management */}
          <form onSubmit={handleVoteSubmit} className="mb-6">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Votes</h3>

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
                  value={voteFormData.totalVotes === 0 ? '' : voteFormData.totalVotes}
                  onChange={(e) => handleVoteFormChange('totalVotes', e.target.value)}
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
                  value={voteFormData.rejectedVotes === 0 ? '' : voteFormData.rejectedVotes}
                  onChange={(e) => handleVoteFormChange('rejectedVotes', e.target.value)}
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
        </div>
      )}
    </div>
  );
};

export default ElectionProcess;
