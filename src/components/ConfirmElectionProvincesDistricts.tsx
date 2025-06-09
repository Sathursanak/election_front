import React, { useState, useEffect } from 'react';
import { useElectionData } from '../context/ElectionDataContext';
import { District, IProvince } from '../types';
import { dataService } from '../utils/dataService';

// Define the same interfaces as in ConfigureElectionProvincesDistricts.tsx
interface ProvinceConfig {
  name: string;
  districts: DistrictConfig[];
}

interface DistrictConfig extends Omit<District, 'province'> {
  // Add any year-specific properties here if needed
}

interface ConfirmElectionProvincesDistrictsProps {
  onStepChange: (step: number) => void;
}

const ConfirmElectionProvincesDistricts: React.FC<ConfirmElectionProvincesDistrictsProps> = ({ onStepChange }) => {
  const { year } = useElectionData();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<IProvince[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  useEffect(() => {
    fetchData();
  }, [year]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [provincesData, districtsData] = await Promise.all([
        dataService.getProvince(),
        dataService.getDistricts()
      ]);

      setProvinces(provincesData);
      setDistricts(districtsData);
    } catch (err) {
      setError("Failed to fetch provinces and districts");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    // Save the current step to localStorage
    localStorage.setItem("adminPanelStep", "4"); // 4 is the step number for "Set Seat Counts"
    // Call the navigation function from AdminPanel
    onStepChange(4);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-teal-600">Loading provinces and districts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-teal-800 mb-4">
        Confirm Provinces and Districts for {year}
      </h2>

      {provinces.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No provinces and districts configured for {year}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-teal-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">
                  Province
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">
                  Number of Districts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">
                  Districts
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {provinces.map((province) => {
                const provinceDistricts = districts.filter(
                  district => district.provinceName === province.provinceName
                );

                return (
                  <tr key={province.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {province.provinceName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {provinceDistricts.length}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <ul className="list-disc ml-4 space-y-1">
                          {provinceDistricts.map((district) => (
                            <li key={district.id} className="text-gray-700">
                              {district.districtName}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Section */}
      {provinces.length > 0 && (
        <div className="bg-teal-50 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-teal-800 mb-3">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-md shadow-sm">
              <div className="text-sm font-medium text-gray-500">Total Provinces</div>
              <div className="text-lg font-semibold text-teal-800">{provinces.length}</div>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <div className="text-sm font-medium text-gray-500">Total Districts</div>
              <div className="text-lg font-semibold text-teal-800">{districts.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Button */}
      {provinces.length > 0 && (
        <div className="flex justify-end mt-6">
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
          >
            Confirm 
          </button>
        </div>
      )}
    </div>
  );
};

export default ConfirmElectionProvincesDistricts; 