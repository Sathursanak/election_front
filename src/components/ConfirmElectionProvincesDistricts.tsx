import React from 'react';
import { useElectionData } from '../context/ElectionDataContext';
import { District } from '../types';

// Define the same interfaces as in ConfigureElectionProvincesDistricts.tsx
interface ProvinceConfig {
  name: string;
  districts: DistrictConfig[];
}

interface DistrictConfig extends Omit<District, 'province'> {
  // Add any year-specific properties here if needed
}

const ConfirmElectionProvincesDistricts: React.FC = () => {
  const { year, electionYearData } = useElectionData();
  const yearConfig: ProvinceConfig[] = electionYearData[year] || [];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Confirm Provinces and Districts for {year}</h2>

      {yearConfig.length === 0 ? (
        <p>No province and district data available for this year.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Province</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Districts</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {yearConfig.map(province => (
              <tr key={province.name}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{province.name}</td>
                <td className="px-6 py-4">
                  <ul className="list-disc ml-4">
                    {province.districts.map(district => (
                      <li key={district.id} className="text-sm text-gray-700">{district.name}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ConfirmElectionProvincesDistricts; 