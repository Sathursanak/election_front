import React, { useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend as ChartLegend,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { useElectionData } from "../context/ElectionDataContext";
import { Party, District, Province } from "../types";
import { getPartyColor } from "../utils/partyColors";

ChartJS.register(ArcElement, Tooltip, ChartLegend);

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .join("");
}

interface PartyWithResults extends Party {
  seats?: number;
  totalSeats?: number;
  qualified?: boolean;
  firstRoundSeats?: number;
  secondRoundSeats?: number;
}

interface ElectionPieChartsProps {
  parties: Party[];
  districts: District[];
  allParties: Party[];
}

// Helper: aggregate party data for a set of districts
function aggregatePartiesByDistricts(
  allParties: Party[],
  districtIds: string[]
) {
  const partyMap: Record<string, Party & { seats: number }> = {};
  allParties.forEach((p) => {
    if (districtIds.includes(p.districtId)) {
      const key = p.name.trim().toLowerCase();
      if (!partyMap[key]) {
        partyMap[key] = { ...p, votes: 0, seats: 0 };
      }
      partyMap[key].votes += p.votes;
      partyMap[key].seats += p.seats || 0;
    }
  });
  return Object.values(partyMap);
}

// Helper: aggregate party data for a province from district results
function aggregatePartiesByProvince(
  calculatedResults: Record<string, PartyWithResults[]>,
  districts: District[],
  provinceId: string
) {
  // Get all districts in this province
  const provinceDistricts = districts.filter(d => d.province === provinceId);
  const provincePartyMap: Record<string, PartyWithResults> = {};

  // For each district in the province
  provinceDistricts.forEach(district => {
    // Get the calculated results for this district
    const districtParties = calculatedResults[district.id] || [];
    
    // For each party in the district
    districtParties.forEach(party => {
      const key = party.name.trim().toLowerCase();
      const partyWithResults = party as PartyWithResults;
      
      // Initialize party data if not exists
      if (!provincePartyMap[key]) {
        provincePartyMap[key] = {
          ...party,
          votes: 0,
          seats: 0,
          totalSeats: 0,
          firstRoundSeats: 0,
          secondRoundSeats: 0,
          hasBonusSeat: false
        } as PartyWithResults;
      }

      // Sum up the values
      const currentParty = provincePartyMap[key];
      if (currentParty) {
        // Sum votes
        currentParty.votes += party.votes;
        
        // Sum seats
        currentParty.seats = (currentParty.seats || 0) + (partyWithResults.seats || 0);
        currentParty.totalSeats = (currentParty.totalSeats || 0) + (partyWithResults.totalSeats || 0);
        currentParty.firstRoundSeats = (currentParty.firstRoundSeats || 0) + (partyWithResults.firstRoundSeats || 0);
        currentParty.secondRoundSeats = (currentParty.secondRoundSeats || 0) + (partyWithResults.secondRoundSeats || 0);
        
        // If any district gives bonus seat, mark it
        if (partyWithResults.hasBonusSeat) {
          currentParty.hasBonusSeat = true;
        }
      }
    });
  });

  // Sort by votes and return
  return Object.values(provincePartyMap).sort((a, b) => b.votes - a.votes);
}

const ElectionPieCharts: React.FC<ElectionPieChartsProps> = ({
  parties,
  districts,
  allParties,
}) => {
  // UI state: which province is expanded (showing districts)?
  const [expandedProvince, setExpandedProvince] = useState<string | null>(null);
  // Tab state: "charts" or "partywise"
  const [activeTab, setActiveTab] = useState<"charts" | "partywise">("charts");
  // Get calculated results from context
  const { calculatedResults } = useElectionData();

  // Island-wide party aggregation from calculated district results
  const islandWidePartyMap: Record<string, PartyWithResults> = {};
  
  // Sum up results from all districts
  Object.values(calculatedResults).forEach(districtParties => {
    districtParties.forEach(party => {
      const key = party.name.trim().toLowerCase();
      const partyWithResults = party as PartyWithResults;
      if (!islandWidePartyMap[key]) {
        islandWidePartyMap[key] = {
          ...party,
          votes: 0,
          seats: 0,
          totalSeats: 0
        } as PartyWithResults;
      }
      const currentParty = islandWidePartyMap[key];
      if (currentParty) {
        currentParty.votes += party.votes;
        currentParty.seats = (currentParty.seats || 0) + (partyWithResults.seats || 0);
        currentParty.totalSeats = (currentParty.totalSeats || 0) + (partyWithResults.totalSeats || 0);
      }
    });
  });

  const islandWideParties = Object.values(islandWidePartyMap).sort(
    (a, b) => b.votes - a.votes
  );

  // Pie chart data generator
  function getPieData(
    parties: PartyWithResults[],
    valueType: "votes" | "seats"
  ) {
    const sorted = [...parties].sort((a, b) => b.votes - a.votes);
    return {
      labels: sorted.map((p) => getInitials(p.name)),
      datasets: [
        {
          data: sorted.map((p) =>
            valueType === "votes" ? p.votes : (p as PartyWithResults).totalSeats || 0
          ),
          backgroundColor: sorted.map((p) => getPartyColor(p)),
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    };
  }

  // Legend for parties (color, name, votes, seats)
  function PartyLegend({
    parties,
  }: {
    parties: PartyWithResults[];
  }) {
    // Show all parties in the same order everywhere
    const sorted = [...parties].sort((a, b) => a.name.localeCompare(b.name));
    return (
      <div className="flex flex-wrap gap-4 mt-4">
        {sorted.map((p) => (
          <div
            key={p.name}
            className="flex items-center space-x-2 text-sm bg-gray-50 px-2 py-1 rounded shadow-sm border border-gray-200"
          >
            <span
              className="inline-block w-4 h-4 rounded-full"
              style={{ background: getPartyColor(p) }}
            />
            <span className="font-semibold text-gray-800">{p.name}</span>
            <span className="text-gray-500">
              Votes: {p.votes.toLocaleString()}
            </span>
            {typeof p.totalSeats === "number" && (
              <span className="text-gray-500">Seats: {p.totalSeats}</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Province pie chart click handler
  function handleProvinceClick(provinceId: string) {
    setExpandedProvince((prev) => (prev === provinceId ? null : provinceId));
  }

  // Responsive grid for pie charts
  function ResponsivePieGrid({ children }: { children: React.ReactNode }) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {children}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto mt-8">
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm focus:outline-none ${
            activeTab === "charts"
              ? "text-teal-800 border-b-2 border-teal-800"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("charts")}
        >
          Charts View
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm focus:outline-none ${
            activeTab === "partywise"
              ? "text-teal-800 border-b-2 border-teal-800"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("partywise")}
        >
          Party-wise Districts
        </button>
      </div>

      {activeTab === "charts" && (
        <>
          {/* Main Island-wide Pie Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-teal-800 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Island-wide Party Results
            </h2>
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1 min-w-[250px]">
                <Pie
                  data={getPieData(islandWideParties, "votes")}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: function (context: any) {
                            const p = islandWideParties[context.dataIndex];
                            return `${
                              p.name
                            }: ${p.votes.toLocaleString()} votes, ${
                              p.totalSeats || 0
                            } seats`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
              <div className="flex-1">
                <PartyLegend parties={islandWideParties} />
              </div>
            </div>
          </div>

          {/* District Results */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              District Results
            </h2>
            <ResponsivePieGrid>
              {districts.filter(d => d.id !== "all-districts").map((district) => {
                const districtParties = calculatedResults[district.id] || [];
                if (districtParties.length === 0) return null;

                return (
                  <div
                    key={district.id}
                    className="bg-white rounded-lg shadow p-4 border-2 border-teal-700 hover:shadow-lg transition"
                  >
                    <h3 className="text-md font-bold text-teal-800 mb-2 text-center">
                      {district.name}
                    </h3>
                    <div className="relative flex flex-col items-center">
                      <Pie
                        data={getPieData(districtParties, "votes")}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              callbacks: {
                                label: function (context: any) {
                                  const p = districtParties[context.dataIndex] as PartyWithResults;
                                  return `${
                                    p.name
                                  }: ${p.votes.toLocaleString()} votes, ${
                                    p.totalSeats || 0
                                  } seats`;
                                },
                              },
                            },
                          },
                        }}
                        width={320}
                        height={320}
                      />
                    </div>
                    <div className="w-full mt-4">
                      <div className="flex flex-wrap justify-center gap-2">
                        <PartyLegend parties={districtParties} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </ResponsivePieGrid>
          </div>
        </>
      )}

      {activeTab === "partywise" && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-teal-800 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Party-wise District Leadership
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {islandWideParties.map((party, i) => {
              // For each district, check if this party is leading (has max votes)
              const leadingDistricts = districts.filter((d) => {
                if (d.id === "all-districts") return false;
                const districtResults = calculatedResults[d.id] || [];
                if (districtResults.length === 0) return false;
                // Find max votes in this district
                const maxVotes = Math.max(
                  ...districtResults.map((p) => p.votes)
                );
                // Is this party the leader (and not 0 votes)?
                return districtResults.some(
                  (p) =>
                    p.name === party.name &&
                    p.votes === maxVotes &&
                    maxVotes > 0
                );
              });

              // Pie chart data: for all districts, 1 if party leads, 0 if not
              const pieData = {
                labels: districts.filter(d => d.id !== "all-districts").map((d) => d.name),
                datasets: [
                  {
                    data: districts.filter(d => d.id !== "all-districts").map((d) => {
                      const districtResults = calculatedResults[d.id] || [];
                      if (districtResults.length === 0) return 0;
                      const maxVotes = Math.max(
                        ...districtResults.map((p) => p.votes)
                      );
                      // 1 if this party is leader, else 0
                      return districtResults.some(
                        (p) =>
                          p.name === party.name &&
                          p.votes === maxVotes &&
                          maxVotes > 0
                      )
                        ? 1
                        : 0;
                    }),
                    backgroundColor: districts.filter(d => d.id !== "all-districts").map((d) => {
                      const districtResults = calculatedResults[d.id] || [];
                      const maxVotes = Math.max(
                        ...districtResults.map((p) => p.votes)
                      );
                      return districtResults.some(
                        (p) =>
                          p.name === party.name &&
                          p.votes === maxVotes &&
                          maxVotes > 0
                      )
                        ? getPartyColor(party)
                        : "#e5e7eb"; // Tailwind gray-200
                    }),
                    borderColor: "#fff",
                    borderWidth: 2,
                  },
                ],
              };

              return (
                <div
                  key={party.name}
                  className="flex flex-col items-center bg-gray-50 rounded-lg shadow p-4 border border-teal-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-block w-4 h-4 rounded-full"
                      style={{ background: getPartyColor(party) }}
                    />
                    <span className="font-semibold text-lg">{party.name}</span>
                  </div>
                  <Pie
                    data={pieData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: function (context: any) {
                              const dName = context.label;
                              const isLeader = context.raw === 1;
                              return isLeader
                                ? `${dName}: Leading`
                                : `${dName}: Not leading`;
                            },
                          },
                        },
                      },
                    }}
                    width={220}
                    height={220}
                  />
                  <div className="mt-2 text-sm text-gray-700 text-center">
                    Leading in:{" "}
                    {leadingDistricts.length > 0 ? (
                      leadingDistricts.map((d) => d.name).join(", ")
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionPieCharts;
