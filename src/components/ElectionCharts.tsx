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
    "#0D4E8B", // Official EC blue (primary)
    "#1E6FBA", // Deep sky blue
    "#2C8C76", // Muted teal (for environmental parties)
    "#6B5B95", // Soft purple
    "#D4A76A", // Warm gold (accent)
    "#8B572A", // Neutral brown
    "#417505", // Olive green
    "#955251", // Dusty red
    "#4A4A4A", // Dark gray (independent/other)
    "#7F7F7F", // Medium gray (minor parties)
  ],
  border: [
    "#0A3A6B", // Darker blue
    "#165A9A", // Darker sky blue
    "#1F6B5B", // Darker teal
    "#534A75", // Darker purple
    "#B58E50", // Darker gold
    "#6D3D1F", // Darker brown
    "#2F5A04", // Darker green
    "#753A39", // Darker red
    "#333333", // Darker gray
    "#5F5F5F", // Darker medium gray
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
    <div className="bg-white rounded-lg shadow-md p-4 border-2 border-teal-800">
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
