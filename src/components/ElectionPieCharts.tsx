import React, { useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend as ChartLegend,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { useElectionData } from "../context/ElectionDataContext";
import { provinces as provinceList } from "../data/mockData";
import { Party, District, Province } from "../types";

ChartJS.register(ArcElement, Tooltip, ChartLegend);

// Consistent color palette for parties
const partyColors = [
  "#1D3557", // Deep navy-teal (rich anchor color)
  "#2A9D8F", // Your app's core teal (brand consistency)
  "#A8DADC", // Light teal (soft contrast)
  "#E9C46A", // Warm gold (complementary pop)
  "#F4A261", // Muted coral (subtle warmth)
  "#457B9D", // Steel blue-teal (harmonious mid-tone)
  "#E76F51", // Burnt sienna (accent—use sparingly)
  "#6A8EAE", // Dusty blue (neutral balance)
  "#F1FAEE", // Off-white (high contrast for key data)
  "#264653", // Dark teal-gray (deep tone for shadows)
];

function getPartyColor(index: number) {
  return partyColors[index % partyColors.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .join("");
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

const ElectionPieCharts: React.FC<ElectionPieChartsProps> = ({
  parties,
  districts,
  allParties,
}) => {
  // UI state: which province is expanded (showing districts)?
  const [expandedProvince, setExpandedProvince] = useState<string | null>(null);
  // Tab state: "charts" or "partywise"
  const [activeTab, setActiveTab] = useState<"charts" | "partywise">("charts");

  // Island-wide party aggregation (by name)
  const partyMap: Record<string, Party & { seats: number }> = {};
  allParties.forEach((p) => {
    const key = p.name.trim().toLowerCase();
    if (!partyMap[key]) {
      partyMap[key] = { ...p, votes: 0, seats: 0 };
    }
    partyMap[key].votes += p.votes;
    partyMap[key].seats += p.seats || 0;
  });
  const islandWideParties = Object.values(partyMap).sort(
    (a, b) => b.votes - a.votes
  );

  // Pie chart data generator
  function getPieData(
    parties: (Party & { seats?: number })[],
    valueType: "votes" | "seats"
  ) {
    const sorted = [...parties].sort((a, b) => b.votes - a.votes);
    return {
      labels: sorted.map((p) => getInitials(p.name)),
      datasets: [
        {
          data: sorted.map((p) =>
            valueType === "votes" ? p.votes : p.seats || 0
          ),
          backgroundColor: sorted.map((_, i) => getPartyColor(i)),
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
    parties: (Party & { seats?: number })[];
  }) {
    const sorted = [...parties].sort((a, b) => b.votes - a.votes);
    return (
      <div className="flex flex-wrap gap-4 mt-4">
        {sorted.map((p, i) => (
          <div
            key={p.name}
            className="flex items-center space-x-2 text-sm bg-gray-50 px-2 py-1 rounded shadow-sm border border-gray-200"
          >
            <span
              className="inline-block w-4 h-4 rounded-full"
              style={{ background: getPartyColor(i) }}
            />
            <span className="font-semibold text-gray-800">{p.name}</span>
            <span className="text-gray-500">
              Votes: {p.votes.toLocaleString()}
            </span>
            {typeof p.seats === "number" && (
              <span className="text-gray-500">Seats: {p.seats}</span>
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
                              p.seats
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

          {/* Province Pie Charts */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Provinces
            </h2>
            <ResponsivePieGrid>
              {provinceList.map((province, idx) => {
                const provinceDistricts = districts.filter(
                  (d) => d.province === province.id
                );
                const provinceDistrictIds = provinceDistricts.map((d) => d.id);
                const provinceParties = aggregatePartiesByDistricts(
                  allParties,
                  provinceDistrictIds
                );
                if (provinceParties.length === 0) return null;
                return (
                  <div
                    key={province.id}
                    className={`bg-white rounded-lg shadow p-4 border-2 border-teal-700 hover:shadow-lg transition ${
                      expandedProvince === province.id
                        ? "ring-2 ring-teal-500"
                        : ""
                    }`}
                    tabIndex={0}
                    aria-label={`Province: ${province.name}`}
                  >
                    <h3 className="text-md font-bold text-teal-800 mb-2 text-center">
                      {province.name}
                    </h3>
                    <div className="relative flex flex-col items-center">
                      <Pie
                        data={getPieData(provinceParties, "votes")}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              callbacks: {
                                label: function (context: any) {
                                  const p = provinceParties[context.dataIndex];
                                  return `${
                                    p.name
                                  }: ${p.votes.toLocaleString()} votes, ${
                                    p.seats
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
                        <PartyLegend parties={provinceParties} />
                      </div>
                    </div>
                    {/* Show/hide district results button below legend */}
                    <div className="flex flex-col items-center mt-4">
                      <button
                        className="flex flex-col items-center group focus:outline-none"
                        onClick={() => setExpandedProvince(province.id)}
                        aria-label={`Show district results for ${province.name}`}
                        type="button"
                      >
                        <span className="text-xs font-semibold text-teal-900 bg-teal-100 px-3 py-2 rounded shadow border border-teal-300 group-hover:bg-teal-200">
                          Show district results
                        </span>
                      </button>
                      {/* Popup for district results */}
                      {expandedProvince === province.id && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                          <div className="relative bg-white rounded-lg shadow-2xl p-8 max-w-5xl w-full mx-4 overflow-y-auto max-h-[90vh]">
                            <button
                              className="absolute top-4 right-4 text-gray-500 hover:text-teal-700 focus:outline-none"
                              onClick={() => setExpandedProvince(null)}
                              aria-label="Close district results"
                              type="button"
                            >
                              <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M6 6l12 12M6 18L18 6"
                                  stroke="#0D4E8B"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            <h4 className="text-lg font-semibold text-gray-700 mb-6 text-center">
                              Districts in {province.name}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {provinceDistricts.map((district) => {
                                const districtParties = allParties.filter(
                                  (p) => p.districtId === district.id
                                );
                                if (districtParties.length === 0) return null;
                                return (
                                  <div
                                    key={district.id}
                                    className="bg-gray-50 rounded-lg shadow p-6 border border-teal-300 flex flex-col items-center relative"
                                    style={{ minWidth: 320, minHeight: 420 }}
                                  >
                                    <h5 className="text-base font-bold text-teal-700 mb-2 text-center">
                                      {district.name}
                                    </h5>
                                    <Pie
                                      data={getPieData(
                                        districtParties,
                                        "votes"
                                      )}
                                      options={{
                                        responsive: true,
                                        plugins: {
                                          legend: { display: false },
                                          tooltip: {
                                            enabled: true,
                                          },
                                        },
                                      }}
                                      width={220}
                                      height={220}
                                    />
                                    <div className="w-full mt-4">
                                      <div className="flex flex-wrap justify-center gap-2">
                                        <PartyLegend
                                          parties={districtParties}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
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
                // Get all parties in this district
                const partiesInDistrict = allParties.filter(
                  (p) => p.districtId === d.id
                );
                if (partiesInDistrict.length === 0) return false;
                // Find max votes in this district
                const maxVotes = Math.max(
                  ...partiesInDistrict.map((p) => p.votes)
                );
                // Is this party the leader (and not 0 votes)?
                return partiesInDistrict.some(
                  (p) =>
                    p.name === party.name &&
                    p.votes === maxVotes &&
                    maxVotes > 0
                );
              });

              // Pie chart data: for all districts, 1 if party leads, 0 if not
              const pieData = {
                labels: districts.map((d) => d.name),
                datasets: [
                  {
                    data: districts.map((d) => {
                      // Get all parties in this district
                      const partiesInDistrict = allParties.filter(
                        (p) => p.districtId === d.id
                      );
                      if (partiesInDistrict.length === 0) return 0;
                      const maxVotes = Math.max(
                        ...partiesInDistrict.map((p) => p.votes)
                      );
                      // 1 if this party is leader, else 0
                      return partiesInDistrict.some(
                        (p) =>
                          p.name === party.name &&
                          p.votes === maxVotes &&
                          maxVotes > 0
                      )
                        ? 1
                        : 0;
                    }),
                    backgroundColor: districts.map((d) => {
                      // Highlight leading districts, gray for others
                      const partiesInDistrict = allParties.filter(
                        (p) => p.districtId === d.id
                      );
                      const maxVotes = Math.max(
                        ...partiesInDistrict.map((p) => p.votes)
                      );
                      return partiesInDistrict.some(
                        (p) =>
                          p.name === party.name &&
                          p.votes === maxVotes &&
                          maxVotes > 0
                      )
                        ? getPartyColor(i)
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
                      style={{ background: getPartyColor(i) }}
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
