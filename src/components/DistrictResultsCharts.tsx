import React, { useEffect, useState } from 'react';
import { Party } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DistrictResultsChartsProps {
  parties: Party[];
  districtName: string;
}

// Available colors for parties
const AVAILABLE_COLORS = [
  'rgba(255, 99, 132, 0.6)',    // Pink
  'rgba(54, 162, 235, 0.6)',    // Blue
  'rgba(255, 206, 86, 0.6)',    // Yellow
  'rgba(75, 192, 192, 0.6)',    // Teal
  'rgba(153, 102, 255, 0.6)',   // Purple
  'rgba(255, 159, 64, 0.6)',    // Orange
  'rgba(199, 199, 199, 0.6)',   // Gray
  'rgba(83, 102, 255, 0.6)',    // Indigo
  'rgba(40, 159, 64, 0.6)',     // Green
  'rgba(210, 199, 199, 0.6)',   // Light Gray
  'rgba(255, 99, 71, 0.6)',     // Red
  'rgba(0, 191, 255, 0.6)',     // Deep Sky Blue
  'rgba(255, 215, 0, 0.6)',     // Gold
  'rgba(106, 90, 205, 0.6)',    // Slate Blue
  'rgba(255, 140, 0, 0.6)',     // Dark Orange
];

const DistrictResultsCharts: React.FC<DistrictResultsChartsProps> = ({ parties, districtName }) => {
  // State to store party colors
  const [partyColors, setPartyColors] = useState<{ [key: string]: string }>({});

  // Initialize or update party colors when parties change
  useEffect(() => {
    setPartyColors(prevColors => {
      const newColors = { ...prevColors };
      let colorIndex = 0;

      // Assign colors to new parties
      parties.forEach(party => {
        if (!newColors[party.name]) {
          // Find the first unused color
          while (Object.values(newColors).includes(AVAILABLE_COLORS[colorIndex])) {
            colorIndex = (colorIndex + 1) % AVAILABLE_COLORS.length;
          }
          newColors[party.name] = AVAILABLE_COLORS[colorIndex];
          colorIndex = (colorIndex + 1) % AVAILABLE_COLORS.length;
        }
      });

      return newColors;
    });
  }, [parties]);

  // Filter out parties with 0 votes
  const validParties = parties.filter(party => party.votes > 0);

  // Prepare data for charts
  const labels = validParties.map(party => party.name);
  const voteData = validParties.map(party => party.votes);
  const seatData = validParties.map(party => party.totalSeats || 0);

  // Get colors for valid parties
  const backgroundColors = validParties.map(party => partyColors[party.name] || AVAILABLE_COLORS[0]);
  const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));

  // Bar chart data
  const barChartData = {
    labels,
    datasets: [
      {
        label: 'Votes',
        data: voteData,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
      {
        label: 'Seats',
        data: seatData,
        backgroundColor: backgroundColors.map(color => color.replace('0.6', '0.4')),
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  // Pie chart data
  const pieChartData = {
    labels,
    datasets: [
      {
        data: voteData,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${districtName} - Votes and Seats Distribution`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: `${districtName} - Vote Share`,
      },
    },
  };

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <Bar data={barChartData} options={barOptions} />
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <Pie data={pieChartData} options={pieOptions} />
      </div>
    </div>
  );
};

export default DistrictResultsCharts; 