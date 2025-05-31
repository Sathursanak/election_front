import React, { useState, useEffect } from 'react';
import { useElectionData } from '../context/ElectionDataContext';
import { District } from '../types';
import { PlusCircle, MinusCircle } from 'lucide-react';

interface ProvinceConfig {
  name: string;
  districts: DistrictConfig[];
}

interface DistrictConfig extends Omit<District, 'province'> { // Extend the existing District type, but omit province as it's in the nested structure
  // Add any year-specific properties here if needed
}

const ConfigureElectionProvincesDistricts: React.FC = () => {
  const { provinces: defaultProvinces, districts: defaultDistricts, year, electionYearData, setElectionYearData } = useElectionData();
  const [yearConfig, setYearConfig] = useState<ProvinceConfig[]>([]);
  const [newProvinceName, setNewProvinceName] = useState('');
  const [newDistrictNames, setNewDistrictNames] = useState<{[key: number]: string}>({});

  useEffect(() => {
    // Load data based on the selected year from electionYearData.
    // If data doesn't exist for the year, use the default data from Data Setup
    // and transform it into the yearConfig structure.
    if (electionYearData && electionYearData[year]) {
      // Load data from the updated structure
      setYearConfig(electionYearData[year]);
    } else if (defaultProvinces.length > 0 && defaultDistricts.length > 0) {
      const initialConfig: ProvinceConfig[] = defaultProvinces.map(provinceName => ({
        name: provinceName,
        districts: defaultDistricts
          .filter(d => d.province === provinceName && d.id !== 'all-districts')
          .map(d => ({ id: d.id, name: d.name, seats: d.seats, totalVotes: d.totalVotes, rejectedVotes: d.rejectedVotes, validVotes: d.validVotes, bonusSeats: d.bonusSeats, bonusSeatPartyId: d.bonusSeatPartyId })) // Map to DistrictConfig, excluding province
      }));
      setYearConfig(initialConfig);
       // Save this initial state to electionYearData for the current year using the updated structure
       setElectionYearData(year, initialConfig);
    }
  }, [defaultProvinces, defaultDistricts, year, electionYearData]);

  const handleProvinceNameChange = (index: number, value: string) => {
    const newConfig = [...yearConfig];
    newConfig[index].name = value;
    setYearConfig(newConfig);
    // Save to context using the updated structure
    setElectionYearData(year, newConfig);
  };

  const handleAddProvince = () => {
    if (newProvinceName.trim() === '') return;
    const updatedConfig = [...yearConfig, { name: newProvinceName.trim(), districts: [] }];
    setYearConfig(updatedConfig);
    setNewProvinceName('');
    // Save to context using the updated structure
    setElectionYearData(year, updatedConfig);
  };

  const handleAddDistrict = (provinceIndex: number) => {
    const districtName = newDistrictNames[provinceIndex];
    if (districtName && districtName.trim() !== '') {
      const newDistrictId = districtName.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
      const newConfig = [...yearConfig];
      newConfig[provinceIndex].districts.push({
        id: newDistrictId,
        name: districtName.trim(),
        seats: 0,
        totalVotes: 0,
        rejectedVotes: 0,
        validVotes: 0,
        bonusSeats: 0,
        bonusSeatPartyId: null,
      });
      setYearConfig(newConfig);
      setNewDistrictNames(prev => ({...prev, [provinceIndex]: ''})); // Clear input after adding
      // Save to context using the updated structure
      setElectionYearData(year, newConfig);
    }
  };

  const handleDistrictNameChange = (provinceIndex: number, districtIndex: number, value: string) => {
    const newConfig = [...yearConfig];
    newConfig[provinceIndex].districts[districtIndex].name = value;
    setYearConfig(newConfig);
    // Save to context using the updated structure
    setElectionYearData(year, newConfig);
  };

  const handleDeleteProvince = (index: number) => {
    const newConfig = yearConfig.filter((_, i) => i !== index);
    setYearConfig(newConfig);
    // Save to context using the updated structure
    setElectionYearData(year, newConfig);
  };

  const handleDeleteDistrict = (provinceIndex: number, districtIndex: number) => {
    const newConfig = [...yearConfig];
    newConfig[provinceIndex].districts = newConfig[provinceIndex].districts.filter((_, i) => i !== districtIndex);
    setYearConfig(newConfig);
    // Save to context using the updated structure
    setElectionYearData(year, newConfig);
  };

  const handleNewDistrictNameChange = (provinceIndex: number, value: string) => {
    setNewDistrictNames(prev => ({...prev, [provinceIndex]: value}));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Configure Provinces and Districts for {year}</h2>

      {/* Display and edit provinces and districts */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Configuration for {year}</h3>
        {yearConfig.map((province, provinceIndex) => (
          <div key={province.name} className="border rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <input 
                type="text"
                value={province.name}
                onChange={(e) => handleProvinceNameChange(provinceIndex, e.target.value)}
                className="border rounded px-2 py-1 text-lg font-semibold mr-2"
              />
              <button onClick={() => handleDeleteProvince(provinceIndex)} className="text-red-600 hover:text-red-800" title="Delete Province"><MinusCircle size={18} /></button>
              <button onClick={() => handleAddDistrict(provinceIndex)} className="text-teal-600 hover:text-teal-800 ml-auto" title="Add District"><PlusCircle size={18} /></button>
            </div>
            <ul className="ml-6 list-disc">
              {province.districts.map((district, districtIndex) => (
                <li key={district.id} className="text-sm text-gray-700 flex items-center mb-1">
                  <input 
                    type="text"
                    value={district.name}
                    onChange={(e) => handleDistrictNameChange(provinceIndex, districtIndex, e.target.value)}
                    className="border rounded px-2 py-1 mr-2"
                  />
                  <button onClick={() => handleDeleteDistrict(provinceIndex, districtIndex)} className="text-red-600 hover:text-red-800" title="Delete District"><MinusCircle size={14} /></button>
                </li>
              ))}
              {/* Input for adding a new district to this province */}
              <li className="text-sm text-gray-700 flex items-center mb-1 mt-2">
                <input 
                  type="text"
                  value={newDistrictNames[provinceIndex] || ''}
                  onChange={(e) => handleNewDistrictNameChange(provinceIndex, e.target.value)}
                  placeholder="New District Name"
                  className="border rounded px-2 py-1 mr-2"
                />
                <button onClick={() => handleAddDistrict(provinceIndex)} className="bg-teal-600 text-white px-4 py-1 rounded hover:bg-teal-700">Add</button>
              </li>
            </ul>
          </div>
        ))}
      </div>

      {/* Form for adding new provinces */}
      <div>
        <h3 className="text-lg font-medium mb-2">Add New Province</h3>
        <div className="flex items-center">
          <input 
            type="text"
            value={newProvinceName}
            onChange={(e) => setNewProvinceName(e.target.value)}
            placeholder="New Province Name"
            className="border rounded px-2 py-1 mr-2"
          />
          <button onClick={handleAddProvince} className="bg-teal-600 text-white px-4 py-1 rounded hover:bg-teal-700">Add Province</button>
        </div>
      </div>

    </div>
  );
};

export default ConfigureElectionProvincesDistricts; 