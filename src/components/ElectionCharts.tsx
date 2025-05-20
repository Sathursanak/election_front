import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { Party } from "../types";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement
);

// Professional color palette
const professionalColors = {
  primary: [
    "#7c3aed", // Vivid teal
    "#22c55e", // Vivid green
    "#ef4444", // Vivid red
    "#f59e42", // Orange
    "#3b82f6", // Blue
    "#eab308", // Yellow
    "#6366f1", // Indigo
    "#f43f5e", // Pink
    "#0ea5e9", // Sky blue
    "#a21caf", // Deep teal
  ],
  border: [
    "#7c3aed",
    "#22c55e",
    "#ef4444",
    "#f59e42",
    "#3b82f6",
    "#eab308",
    "#6366f1",
    "#f43f5e",
    "#0ea5e9",
    "#a21caf",
  ],
};

interface ElectionChartsProps {
  parties: Party[];
  districtName: string;
}

// Helper to get initials from party name
function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .join("");
}

const ElectionCharts: React.FC<ElectionChartsProps> = ({
  parties,
  districtName,
}) => {
  // Sort parties by votes in descending order
  const sortedParties = [...parties].sort((a, b) => b.votes - a.votes);

  // Prepare data for charts
  const chartData = {
    labels: sortedParties.map((party) => getInitials(party.name)),
    datasets: [
      {
        label: "Votes",
        data: sortedParties.map((party) => party.votes),
        backgroundColor: professionalColors.primary,
        borderColor: professionalColors.border,
        borderWidth: 1,
      },
    ],
  };

  const percentageData = {
    labels: sortedParties.map((party) => getInitials(party.name)),
    datasets: [
      {
        label: "Vote Percentage",
        data: sortedParties.map((party) => party.percentage || 0),
        backgroundColor: professionalColors.primary,
        borderColor: professionalColors.border,
        borderWidth: 1,
      },
    ],
  };

  const seatsData = {
    labels: sortedParties.map((party) => getInitials(party.name)),
    datasets: [
      {
        label: "Seats",
        data: sortedParties.map((party) => party.seats),
        backgroundColor: professionalColors.primary,
        borderColor: professionalColors.border,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            size: 12,
            weight: "bold",
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
        // Disable legend click toggling
        onClick: () => {},
      },
      title: {
        display: true,
        text: `${districtName} Election Results`,
        font: {
          family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
          size: 16,
          weight: "600",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#2c3e50",
        bodyColor: "#2c3e50",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function (context: {
            dataset: { label: string };
            parsed: { y?: number; [key: string]: any };
          }) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== undefined) {
              label += context.parsed.y.toLocaleString();
            } else if (context.parsed !== undefined) {
              label += context.parsed.toLocaleString();
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          font: {
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Election Results Visualization
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Votes Bar Chart */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Votes Distribution
          </h3>
          <Bar
            data={chartData}
            options={{
              ...options,
              plugins: {
                ...options.plugins,
                title: {
                  display: true,
                  text: "Votes by Party",
                },
              },
            }}
          />
        </div>

        {/* Percentage Pie Chart */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Vote Percentage
          </h3>
          <Pie
            data={percentageData}
            options={{
              ...options,
              plugins: {
                ...options.plugins,
                title: {
                  display: true,
                  text: "Vote Percentage by Party",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ElectionCharts;
