import React, { useState, useEffect } from 'react';
import { useElectionData } from '../context/ElectionDataContext';
import { District } from '../types';

const SetSeatCounts: React.FC = () => {
  // Get year-specific data and year from context
  const {
    year,
    electionYearData,
    updateSettings,
    districts: globalDistricts,
    districtSeatInputs,
    setDistrictSeatInputs,
  } = useElectionData();

  // Local state for manual-only total seat input
  const [tempTotalSeatsInput, setTempTotalSeatsInput] = useState<string>("196");
  const [tempTotalSeats, setTempTotalSeats] = useState<number>(196);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Get the year-specific configured districts from electionYearData
  const yearConfig = electionYearData[year];
  // Flatten and ensure province is included
  const configuredDistricts: District[] = yearConfig
    ? yearConfig.flatMap(
      (province) =>
        province.districts.map((district) => ({
          ...district,
          province: province.name,
        }))
    )
    : [];

  useEffect(() => {
    setTempTotalSeatsInput(tempTotalSeats ? String(tempTotalSeats) : "");
  }, [tempTotalSeats]);

  const handleDistrictSeatInputChange = (districtId: string, value: string) => {
    setDistrictSeatInputs((prev) => ({
      ...prev,
      [districtId]: value.replace(/[^\d]/g, ""),
    }));
  };

  const commitDistrictSeatInput = (districtId: string) => {
    const value = districtSeatInputs[districtId];
    if (value === undefined) return;
    const seats = value === "" ? 0 : parseInt(value);

    // Update the seats in the year-specific configuration
    const updatedYearConfig =
      yearConfig?.map((province) => ({
        ...province,
        districts: province.districts.map((district) =>
          district.id === districtId ? { ...district, seats: seats } : district
        ),
      })) || [];

    // Flatten the updated districts to pass to updateSettings
    const updatedDistrictsFlat: District[] = updatedYearConfig.flatMap(
      (province) =>
        province.districts.map((district) => ({
          ...district,
          province: province.name,
        }))
    );

    // Include the 'all-districts' placeholder if it exists in the original districts
    const allDistrictsPlaceholder = globalDistricts.find(
      (d) => d.id === "all-districts"
    );
    const finalDistrictsToSave = allDistrictsPlaceholder
      ? [...updatedDistrictsFlat, allDistrictsPlaceholder]
      : updatedDistrictsFlat;

    updateSettings?.({
      districts: finalDistrictsToSave,
      totalSeats: tempTotalSeats,
    });
  };

  const handleTempTotalSeatsInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTempTotalSeatsInput(e.target.value.replace(/[^\d]/g, ""));
  };

  const commitTempTotalSeatsInput = () => {
    const value = parseInt(tempTotalSeatsInput);
    if (!isNaN(value)) {
      setTempTotalSeats(value);
    }
  };

  const handleSetTotalSeats = () => {
    if (tempTotalSeats <= 0) {
      setFormError("Total seats must be greater than 0");
      return;
    }

    // Use the local input state for seats
    const updatedDistricts = configuredDistricts.map((district) => ({
      ...district,
      seats: parseInt(districtSeatInputs[district.id]) || 0,
    }));

    const currentTotalDistrictSeats = updatedDistricts.reduce(
      (sum, district) => sum + (district.seats || 0),
      0
    );

    if (tempTotalSeats < currentTotalDistrictSeats) {
      setFormError(
        `Total seats cannot be less than current district seats (${currentTotalDistrictSeats})`
      );
      return;
    }

    // Include the 'all-districts' placeholder if it exists in the original districts
    const allDistrictsPlaceholder = globalDistricts.find(
      (d) => d.id === "all-districts"
    );
    const finalDistrictsToSave = allDistrictsPlaceholder
      ? [...updatedDistricts, allDistrictsPlaceholder]
      : updatedDistricts;

    updateSettings?.({
      districts: finalDistrictsToSave,
      totalSeats: tempTotalSeats,
    });

    // After saving, update local state to reflect saved seats
    const newInputs: Record<string, string> = {};
    updatedDistricts.forEach((d) => {
      newInputs[d.id] = d.seats === 0 ? "" : String(d.seats);
    });
    setDistrictSeatInputs(newInputs);

    setFormSuccess("Seat configuration updated successfully");
    setTimeout(() => setFormSuccess(null), 3000);
  };

  // If no districts are configured yet for the year, show a message
  if (!yearConfig || configuredDistricts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-teal-800">
          <h2 className="text-xl font-semibold mb-4 text-teal-800">Configure Parliament Seats</h2>
          <div className="text-center py-8">
            <p className="text-gray-600">
              Please configure provinces and districts in the previous steps
              first for the selected year.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate current total district seats from local input state
  const currentTotalDistrictSeats = Object.values(districtSeatInputs).reduce(
    (sum, val) => sum + (parseInt(val) || 0),
    0
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-teal-800">
        <h2 className="text-xl font-semibold mb-4 text-teal-800">Configure Parliament Seats</h2>

        {formError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {formError}
          </div>
        )}

        {formSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {formSuccess}
          </div>
        )}

        <div className="space-y-8">
          {/* Total Seats Section */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-teal-800 mb-4">
              Total Seats
            </h3>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                inputMode="numeric"
                min="1"
                value={tempTotalSeatsInput}
                onChange={handleTempTotalSeatsInputChange}
                onBlur={commitTempTotalSeatsInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitTempTotalSeatsInput();
                }}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-800 focus:border-teal-800"
                autoComplete="off"
              />
              <div className="text-sm text-gray-600">
                Current District Seats: {currentTotalDistrictSeats}
                {currentTotalDistrictSeats !== tempTotalSeats && (
                  <span className="ml-2 text-red-600">
                    ({tempTotalSeats - currentTotalDistrictSeats} seats
                    remaining)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* District Seats Section */}
          <div>
            <h3 className="text-lg font-semibold text-teal-800 mb-4">
              Assign Seats to Districts
            </h3>
            <div className="space-y-4">
              {configuredDistricts.map((district) => (
                <div key={district.id} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">
                        {district.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {district.province}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <input
                        type="text"
                        inputMode="numeric"
                        min="0"
                        value={districtSeatInputs[district.id] ?? ""}
                        onChange={(e) =>
                          handleDistrictSeatInputChange(
                            district.id,
                            e.target.value
                          )
                        }
                        onBlur={() => commitDistrictSeatInput(district.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            commitDistrictSeatInput(district.id);
                        }}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-800 focus:border-teal-800"
                        placeholder="Seats"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSetTotalSeats}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              Save Seat Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetSeatCounts;
