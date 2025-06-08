import React, { useState, useEffect } from "react";
import { useElectionData } from "../context/ElectionDataContext";
// Import the updated interfaces from src/types/index.ts
import { District, IProvince } from "../types";
import { dataService } from '../utils/dataService';

// Removed local interface definitions as they are now imported from ../types

const ConfigureElectionProvincesDistricts: React.FC = () => {
  const { year } = useElectionData();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<IProvince[]>([]); // Use IProvince
  const [districts, setDistricts] = useState<District[]>([]);
  const [newProvinces, setNewProvinces] = useState<{ name: string; districtCount: string }[]>([]);
  const [districtNames, setDistrictNames] = useState<{ [provinceName: string]: string[] }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [targetProvinceCount, setTargetProvinceCount] = useState<number>(0);

  useEffect(() => {
    fetchData();
    // Get the target number of provinces from localStorage
    const savedCount = localStorage.getItem('numberOfProvinces');
    if (savedCount) {
      setTargetProvinceCount(parseInt(savedCount));
    }
  }, [year]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch both provinces and districts in parallel
      const [provincesData, districtsData] = await Promise.all([
        dataService.getProvince(),
        dataService.getDistricts()
      ]);

      console.log('Fetched provinces:', provincesData);
      console.log('Fetched districts:', districtsData);

      setProvinces(provincesData);
      setDistricts(districtsData);
    } catch (err) {
      setError("Failed to fetch provinces and districts");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProvince = () => {
    // Check if adding another province would exceed the target count
    if (provinces.length + newProvinces.length >= targetProvinceCount) {
      setFormError(`Cannot add more provinces. Target count is ${targetProvinceCount}`);
      return;
    }
    setNewProvinces([...newProvinces, { name: '', districtCount: '' }]);
  };

  const handleProvinceChange = (index: number, field: 'name' | 'districtCount', value: string) => {
    const updatedProvinces = [...newProvinces];
    updatedProvinces[index] = {
      ...updatedProvinces[index],
      [field]: field === 'districtCount' ? value.replace(/[^\d]/g, '') : value
    };
    setNewProvinces(updatedProvinces);
  };

  const handleAddProvinces = async () => {
    // Validate province names and counts
    if (newProvinces.some(p => !p.name.trim() || !p.districtCount)) {
      setFormError("Please fill in all province names and district counts");
      return;
    }

    // Check if total provinces would exceed target count
    if (provinces.length + newProvinces.length > targetProvinceCount) {
      setFormError(`Cannot add more provinces. Target count is ${targetProvinceCount}`);
      return;
    }

    // Check for duplicate names
    const allProvinceNames = [...provinces.map(p => p.provinceName), ...newProvinces.map(p => p.name)];
    const uniqueNames = new Set(allProvinceNames.map(name => name.toLowerCase()));
    if (uniqueNames.size !== allProvinceNames.length) {
      setFormError("Province names must be unique");
      return;
    }

    try {
      // Add each new province
      for (const province of newProvinces) {
        await dataService.addProvince({
          id: '', // Backend will generate this
          provinceName: province.name.trim(),
          noOfDistricts: parseInt(province.districtCount)
        });
      }

      // Initialize district names for new provinces
      const newDistrictNames = { ...districtNames };
      newProvinces.forEach(province => {
        newDistrictNames[province.name] = Array(parseInt(province.districtCount)).fill('');
      });
      setDistrictNames(newDistrictNames);

      setFormSuccess("Provinces added successfully");
      setTimeout(() => setFormSuccess(null), 1000);

      // Refresh data
      fetchData();
      setNewProvinces([]);
    } catch (err) {
      setFormError("Failed to add provinces");
      console.error("Error adding provinces:", err);
    }
  };

  const handleDistrictNameChange = (provinceName: string, index: number, value: string) => {
    setDistrictNames(prev => ({
      ...prev,
      [provinceName]: prev[provinceName].map((name, i) => i === index ? value : name)
    }));
  };

  const handleSaveDistricts = async () => {
    // Validate all district names are filled
    const allNamesFilled = Object.entries(districtNames).every(([_, names]) =>
      names.every(name => name.trim() !== '')
    );

    if (!allNamesFilled) {
      setFormError("Please fill in all district names");
      return;
    }

    try {
      // Add districts for each province
      for (const [provinceName, names] of Object.entries(districtNames)) {
        const province = provinces.find(p => p.provinceName === provinceName);
        if (!province) continue;

        for (const name of names) {
          await dataService.addDistrict({
            id: '', // Backend will generate this
            districtName: name.trim(),
            idProvince: province.id,
            provinceName: province.provinceName,
            totalVotes: 0,
            rejectedVotes: 0,
            validVotes: 0,
            seats: 0,
            bonusSeats: 0,
            bonusSeatPartyId: null
          });
        }
      }

      setFormSuccess("Districts saved successfully");
      setTimeout(() => setFormSuccess(null), 1000);

      // Refresh data
      fetchData();
      setDistrictNames({});
    } catch (err) {
      setFormError("Failed to save districts");
      console.error("Error saving districts:", err);
    }
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
        Provinces and Districts for {year}
      </h2>

      {/* Add New Provinces Section */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-teal-200">
        <h3 className="text-lg font-semibold text-teal-800 mb-4">
          Add New Provinces ({provinces.length + newProvinces.length}/{targetProvinceCount})
        </h3>

        {formError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {formError}
          </div>
        )}

        {formSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {formSuccess}
          </div>
        )}

        <div className="space-y-4">
          {newProvinces.map((province, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Province Name
                </label>
                <input
                  type="text"
                  value={province.name}
                  onChange={(e) => handleProvinceChange(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter province name"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Districts
                </label>
                <input
                  type="text"
                  value={province.districtCount}
                  onChange={(e) => handleProvinceChange(index, 'districtCount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter number of districts"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-4">
          <button
            onClick={handleAddProvince}
            disabled={provinces.length + newProvinces.length >= targetProvinceCount}
            className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${provinces.length + newProvinces.length >= targetProvinceCount
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500'
              }`}
          >
            Add Province
          </button>
          {newProvinces.length > 0 && (
            <button
              onClick={handleAddProvinces}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Save Provinces
            </button>
          )}
        </div>
      </div>

      {/* District Names Section */}
      {Object.keys(districtNames).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 border border-teal-200">
          <h3 className="text-lg font-semibold text-teal-800 mb-4">Enter District Names</h3>

          <div className="space-y-6">
            {Object.entries(districtNames).map(([provinceName, names]) => (
              <div key={provinceName} className="border-b border-gray-200 pb-4">
                <h4 className="font-medium text-teal-800 mb-3">{provinceName}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {names.map((name, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        District {index + 1}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleDistrictNameChange(provinceName, index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        placeholder={`Enter district name ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button
              onClick={handleSaveDistricts}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Save Districts
            </button>
          </div>
        </div>
      )}

      {/* Existing Provinces and Districts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {provinces.map((province) => {
          // Filter districts for this province using provinceName
          const provinceDistricts = districts.filter(
            district => district.provinceName === province.provinceName
          );

          return (
            <div key={province.id} className="bg-white rounded-lg shadow-md p-4 border border-teal-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-teal-800 border-b border-teal-200 pb-2">
                  {province.provinceName}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {provinceDistricts.length} Districts
                </p>
              </div>

              <div className="space-y-2">
                {provinceDistricts.map((district) => (
                  <div
                    key={district.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100"
                  >
                    <span className="text-gray-700">{district.districtName}</span>
                    {/* No longer displaying ID, as requested by the user. */}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {provinces.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No provinces and districts configured for {year}
        </div>
      )}
    </div>
  );
};

export default ConfigureElectionProvincesDistricts;