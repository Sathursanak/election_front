import React, { useEffect, useState } from 'react';
import { useElectionData } from '../context/ElectionDataContext';
import DistrictNavigation from '../components/DistrictNavigation';
import SriLankaMap from '../components/SriLankaMap';
import ElectionPieCharts from '../components/ElectionPieCharts';
import SummaryTable from '../components/SummaryTable';
import PartyResults from '../components/PartyResults';
import { allocateSeats, Party } from '../utils/seatAllocation';
import DistrictResultsCharts from '../components/DistrictResultsCharts';

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

const Results: React.FC = () => {
  const {
    year,
    districts,
    parties,
    selectedDistrictId,
    districtNominations,
    electionStats,
    calculatedResults,
    setCalculatedResults
  } = useElectionData();

  // --- UI State ---
  const [calculationDone, setCalculationDone] = useState(false);
  const [calculatedParties, setCalculatedParties] = useState<Party[]>([]);
  const [bonusSeatPartyName, setBonusSeatPartyName] = useState<string | null>(null);

  // If "all-districts" is selected, show island-wide result
  const isIslandWide = selectedDistrictId === "all-districts";
  let selectedDistrict = districts.find((d) => d.id === selectedDistrictId);

  // Get assigned parties for the selected district
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

    const partyMap: Record<string, any> = {};
    parties.forEach((p) => {
      if (!allAssignedPartyIds.has(p.id)) return;

      const key = p.name.trim().toLowerCase();
      if (!partyMap[key]) {
        partyMap[key] = { ...p, votes: 0, seats: 0, districts: new Set() };
      }
      partyMap[key].votes += p.votes || 0;
      partyMap[key].seats += p.seats || 0;
      partyMap[key].districts.add(p.districtId);
    });

    const allSeats = electionStats.totalSeats;
    const allParties = Object.values(partyMap).map((p: any) => ({
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
      totalVotes: allParties.reduce((sum, p) => sum + (p.votes || 0), 0),
      rejectedVotes: 0,
      province: "All",
      bonusSeats: 0,
      bonusSeatPartyId: null,
    };

    islandWideStats = {
      leadingParty: allocated.reduce(
        (prev, curr) => (curr.votes || 0) > (prev.votes || 0) ? curr : prev,
        allocated[0]
      ),
      totalVotes: allParties.reduce((sum, p) => sum + (p.votes || 0), 0),
      totalSeats: allSeats,
    };
  } else {
    selectedDistrict = districts.find((d) => d.id === selectedDistrictId) || districts[0];
    selectedPartiesRaw = parties.filter(
      (p) => p.districtId === selectedDistrictId && assignedPartyIds.includes(p.id)
    );
    selectedParties = allocateSeats(selectedPartiesRaw, selectedDistrict.seats);
  }

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
      : selectedParties;

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
  }, [selectedDistrictId, selectedParties, calculatedParties]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Column - Navigation */}
      <DistrictNavigation className="w-64 flex-shrink-0" showIslandWideOption />

      {/* Middle Column - Results */}
      <div className="flex-1 p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {isIslandWide
              ? "Island-wide Results"
              : `${selectedDistrict.name} District Results`}
          </h1>
          <p className="text-gray-600">Parliamentary Election {year}</p>
        </header>

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

            {/* District Party Results Table */}
            {calculationDone && calculatedParties.length > 0 && (
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
                        {calculatedParties.map((party, idx) => {
                          const partyWithResults = party as PartyWithResults;
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
                                {party.votes.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {partyWithResults.qualified === false ? "Disqualified" : "Qualified"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {partyWithResults.percentage?.toFixed(1)}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {partyWithResults.firstRoundSeats || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {partyWithResults.secondRoundSeats || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {partyWithResults.totalSeats || 0}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}



            {/* Add Charts when calculation is done */}
            {calculationDone && calculatedParties.length > 0 && (
              <DistrictResultsCharts
                parties={calculatedParties}
                districtName={selectedDistrict.name}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Results;
