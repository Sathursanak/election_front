import React, { useState, useEffect } from "react";
import { useElectionData } from "../context/ElectionDataContext";
import { dataService } from "../utils/dataService";
import { IProvince } from "../types";

// Common styles for all step components (copied from AdminPanel)
const commonStyles = {
  container: "max-w-4xl mx-auto",
  card: "bg-white rounded-lg shadow-md p-6 border-2 border-teal-800",
  title: "text-xl font-semibold mb-4 text-teal-800",
  formGroup: "mb-6",
  label: "block text-sm font-medium text-gray-700 mb-2",
  input:
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-800 focus:border-teal-800",
  select:
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-800 focus:border-teal-800",
  button: {
    primary:
      "px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
    secondary:
      "px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
    danger:
      "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
  },
  table: {
    container: "overflow-x-auto",
    table: "min-w-full divide-y divide-gray-200",
    header: "bg-gray-50",
    headerCell:
      "px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider",
    body: "bg-white divide-y divide-gray-200",
    row: "hover:bg-gray-50",
    cell: "px-6 py-4 whitespace-nowrap text-sm text-gray-700",
  },
  alert: {
    success:
      "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4",
    error:
      "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4",
  },
};

const DATA_SETUP_COMPLETE_KEY = "dataSetupCompleteSession";
const CURRENT_STEP_KEY = "currentStepSession";
const PROVINCE_STEP_DONE_KEY = "provinceStepDoneSession";
const DISTRICT_STEP_DONE_KEY = "districtStepDoneSession";

const DataSetup: React.FC = () => {
  const { provinces, setProvinces, districts, updateSettings } =
    useElectionData();
  // Add edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  // Step 1: Province setup
  const [numberOfProvinces, setNumberOfProvinces] = useState<number>(0);
  const [provinceNames, setProvinceNames] = useState<string[]>([]);
  const [provinceStepDone, setProvinceStepDone] = useState(false);
  // Step 2: District setup
  const [districtCounts, setDistrictCounts] = useState<Record<string, number>>(
    {}
  );
  const [districtNames, setDistrictNames] = useState<Record<string, string[]>>(
    {}
  );
  const [districtStepDone, setDistrictStepDone] = useState(false);
  // Step 3: Confirmation
  const [confirmStep, setConfirmStep] = useState(false);
  // New state to track if setup is complete in the current session
  const [isSetupCompleteInSession, setIsSetupCompleteInSession] = useState(false);
  // Error/success
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Add new state for loading provinces
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [existingProvinces, setExistingProvinces] = useState<IProvince[]>([]);
  const [existingDistricts, setExistingDistricts] = useState<Record<string, string[]>>({});

  // Helper functions for incrementing/decrementing province count
  const incrementProvinceCount = () => {
    if (!isEditMode) return;
    const newCount = numberOfProvinces + 1;
    updateProvinceCount(newCount);
  };

  const decrementProvinceCount = () => {
    if (!isEditMode) return;
    const newCount = numberOfProvinces - 1;
    updateProvinceCount(newCount);
  };

  const updateProvinceCount = (newCount: number) => {
    if (existingProvinces.length > 0 && newCount < existingProvinces.length) {
      setFormError(`Number of provinces cannot be less than ${existingProvinces.length} (existing provinces)`);
      return;
    }

    if (newCount < 0) return; // Prevent negative numbers

    const newProvinceNames = [...provinceNames];

    if (newCount < newProvinceNames.length) {
      newProvinceNames.splice(newCount);
    } else if (newCount > newProvinceNames.length) {
      while (newProvinceNames.length < newCount) {
        newProvinceNames.push("");
      }
    }

    setNumberOfProvinces(newCount);
    setProvinceNames(newProvinceNames);
    setFormError(null);
    setFormSuccess(null);
  };

  // Fetch provinces and districts from backend when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const provinces = await dataService.getProvince();
        if (provinces.length > 0) {
          setExistingProvinces(provinces);
          setProvinceNames(provinces.map(p => p.provinceName));
          setNumberOfProvinces(provinces.length);

          // Get all districts from backend
          const response = await fetch('http://localhost:8000/district');
          const data = await response.json();

          if (data.status === 'success' && Array.isArray(data.districts)) {
            // Group districts by province
            const districtGroups: Record<string, string[]> = {};
            const counts: Record<string, number> = {};

            // Initialize with empty arrays for all provinces
            provinces.forEach(p => {
              districtGroups[p.provinceName] = [];
              counts[p.provinceName] = 0;
            });

            // Populate districts for each province
            data.districts.forEach((district: any) => {
              const provinceName = district.provinceName;
              if (districtGroups[provinceName]) {
                districtGroups[provinceName].push(district.districtName);
                counts[provinceName] = (counts[provinceName] || 0) + 1;
              }
            });

            setDistrictNames(districtGroups);
            setDistrictCounts(counts);
            setExistingDistricts(districtGroups);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setFormError('Failed to fetch data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // On mount, check session storage and restore state
  useEffect(() => {
    const isCompleteInSessionStorage = sessionStorage.getItem(DATA_SETUP_COMPLETE_KEY) === "true";
    const currentStep = sessionStorage.getItem(CURRENT_STEP_KEY);
    const provinceStepDone = sessionStorage.getItem(PROVINCE_STEP_DONE_KEY) === "true";
    const districtStepDone = sessionStorage.getItem(DISTRICT_STEP_DONE_KEY) === "true";

    if (isCompleteInSessionStorage) {
      setIsSetupCompleteInSession(true);
      setConfirmStep(true);
    }

    if (currentStep) {
      switch (currentStep) {
        case "provinces":
          setProvinceStepDone(false);
          setDistrictStepDone(false);
          setConfirmStep(false);
          break;
        case "districts":
          setProvinceStepDone(true);
          setDistrictStepDone(false);
          setConfirmStep(false);
          break;
        case "confirm":
          setProvinceStepDone(true);
          setDistrictStepDone(true);
          setConfirmStep(true);
          break;
        default:
          break;
      }
    } else {
      // If no step is stored, check individual step states
      if (provinceStepDone) {
        setProvinceStepDone(true);
      }
      if (districtStepDone) {
        setProvinceStepDone(true);
        setDistrictStepDone(true);
      }
    }
  }, []);

  // Update session storage when steps change
  useEffect(() => {
    if (confirmStep) {
      sessionStorage.setItem(CURRENT_STEP_KEY, "confirm");
      sessionStorage.setItem(PROVINCE_STEP_DONE_KEY, "true");
      sessionStorage.setItem(DISTRICT_STEP_DONE_KEY, "true");
    } else if (districtStepDone) {
      sessionStorage.setItem(CURRENT_STEP_KEY, "districts");
      sessionStorage.setItem(PROVINCE_STEP_DONE_KEY, "true");
    } else if (provinceStepDone) {
      sessionStorage.setItem(CURRENT_STEP_KEY, "provinces");
    }
  }, [provinceStepDone, districtStepDone, confirmStep]);

  // Add function to fetch provinces
  const fetchProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const provinces = await dataService.getProvince();
      if (provinces.length > 0) {
        setProvinceNames(provinces.map(p => p.provinceName));
        setNumberOfProvinces(provinces.length);
        // Initialize district counts from backend data
        const counts: Record<string, number> = {};
        provinces.forEach(p => {
          counts[p.provinceName] = p.noOfDistricts;
        });
        setDistrictCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
      setFormError('Failed to fetch provinces. Please try again.');
    } finally {
      setLoadingProvinces(false);
    }
  };

  // Step 1: Province setup
  const handleProvinceCountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Always prevent direct typing
    e.preventDefault();
  };

  const handleProvinceNameChange = (idx: number, value: string) => {
    if (!isEditMode) return;
    const arr = [...provinceNames];
    arr[idx] = value;
    setProvinceNames(arr);
    setFormError(null);
  };

  const handleProvinceDistrictCountChange = (idx: number, value: string) => {
    if (!isEditMode) return;
    const count = parseInt(value.replace(/[^\d]/g, ""));
    const provinceName = provinceNames[idx];
    if (provinceName) {
      setDistrictCounts(prev => ({
        ...prev,
        [provinceName]: isNaN(count) ? 0 : count
      }));
      setDistrictNames(prev => ({
        ...prev,
        [provinceName]: Array(isNaN(count) ? 0 : count).fill("")
      }));
    }
    setFormError(null);
  };

  const handleProvinceDelete = (idx: number) => {
    if (!isEditMode) return;

    // Check if province has any districts
    const provinceName = provinceNames[idx];
    if (districtNames[provinceName]?.length > 0) {
      setFormError(`Cannot delete ${provinceName} because it has districts. Please delete the districts first.`);
      return;
    }

    // Remove the province and its associated data
    const newProvinceNames = [...provinceNames];
    newProvinceNames.splice(idx, 1);
    setProvinceNames(newProvinceNames);
    setNumberOfProvinces(newProvinceNames.length);

    // Remove from district counts and names
    const newDistrictCounts = { ...districtCounts };
    const newDistrictNames = { ...districtNames };
    delete newDistrictCounts[provinceName];
    delete newDistrictNames[provinceName];
    setDistrictCounts(newDistrictCounts);
    setDistrictNames(newDistrictNames);

    setFormError(null);
    setFormSuccess(null);
  };

  const handleAddDistrict = (provinceName: string) => {
    if (!isEditMode) return;

    setDistrictCounts(prev => ({
      ...prev,
      [provinceName]: (prev[provinceName] || 0) + 1
    }));

    setDistrictNames(prev => ({
      ...prev,
      [provinceName]: [...(prev[provinceName] || []), ""]
    }));
  };

  const handleProvinceNext = async () => {
    // Validate only filled province names
    const filledProvinces = provinceNames.filter(n => n.trim());
    if (filledProvinces.length === 0) {
      setFormError("At least one province must be filled");
      return;
    }

    // Check for duplicates among filled provinces
    const unique = new Set(filledProvinces.map((n) => n.trim().toLowerCase()));
    if (unique.size !== filledProvinces.length) {
      setFormError("Province names must be unique");
      return;
    }

    // Check if all filled provinces have district counts
    for (const province of filledProvinces) {
      if (!districtCounts[province] || districtCounts[province] < 1) {
        setFormError(`Please specify number of districts for ${province}`);
        return;
      }
    }

    try {
      // Get existing provinces to check if we need to post new ones
      const existingProvinces = await dataService.getProvince();
      const existingProvinceNames = new Set(existingProvinces.map(p => p.provinceName.toLowerCase()));

      // Filter out new provinces (ones that don't exist in the database)
      const newProvinces = filledProvinces.filter(province =>
        !existingProvinceNames.has(province.toLowerCase())
      );

      if (newProvinces.length > 0) {
        // Only post new provinces
        const payload = newProvinces.map((province) => ({
          provinceName: province,
          noOfDistricts: districtCounts[province] || 0,
        }));

        // Send each new province to the backend
        for (const province of payload) {
          await dataService.addProvince(province);
        }
        setFormSuccess("New provinces added successfully!");
      } else {
        setFormSuccess("Proceeding to next step...");
      }

      setProvinces([...filledProvinces]);
      setProvinceStepDone(true);
      setFormError(null);

    } catch (error) {
      console.error('Error handling provinces:', error);
      setFormError("Failed to process provinces. Please try again.");
    }
  };

  // Step 2: District setup
  const handleDistrictCountChange = (province: string, value: string) => {
    const v = parseInt(value.replace(/[^\d]/g, ""));
    const newCount = isNaN(v) ? 0 : v;

    // Keep existing districts and add empty slots for new ones
    const existingDistricts = districtNames[province] || [];
    const newDistricts = [...existingDistricts];
    while (newDistricts.length < newCount) {
      newDistricts.push("");
    }

    setDistrictCounts((prev) => ({ ...prev, [province]: newCount }));
    setDistrictNames((prev) => ({
      ...prev,
      [province]: newDistricts
    }));
    setFormError(null);
  };

  const handleDistrictNameChange = (
    province: string,
    idx: number,
    value: string
  ) => {
    if (!isEditMode) return;
    setDistrictNames((prev) => {
      const arr = [...(prev[province] || [])];
      arr[idx] = value;
      return { ...prev, [province]: arr };
    });
    setFormError(null);
  };

  const handleDistrictDelete = (province: string, districtIndex: number) => {
    if (!isEditMode) return;

    setDistrictNames(prev => {
      const districts = [...(prev[province] || [])];
      districts.splice(districtIndex, 1);
      return { ...prev, [province]: districts };
    });

    setDistrictCounts(prev => ({
      ...prev,
      [province]: (prev[province] || 0) - 1
    }));
  };

  const handleDistrictNext = async () => {
    // Get all filled district names
    const filledDistricts: { province: string; name: string }[] = [];
    for (const province of provinceNames) {
      const districts = districtNames[province] || [];
      districts.forEach((name, idx) => {
        if (name.trim()) {
          filledDistricts.push({ province, name: name.trim() });
        }
      });
    }

    if (filledDistricts.length === 0) {
      setFormError("At least one district must be filled");
      return;
    }

    // Check if any district name matches a province name
    for (const { name } of filledDistricts) {
      if (provinceNames.some(province =>
        province.trim().toLowerCase() === name.toLowerCase()
      )) {
        setFormError("District names cannot be the same as province names");
        return;
      }
    }

    // Check for duplicates across all districts
    const allNames = filledDistricts.map(d => d.name.toLowerCase());
    const hasDup = allNames.some(
      (n, i) => allNames.findIndex(x => x === n) !== i
    );
    if (hasDup) {
      setFormError("District names must be unique across all provinces");
      return;
    }

    try {
      // Get existing districts from backend
      const response = await fetch('http://localhost:8000/district');
      const data = await response.json();

      if (data.status === 'success' && Array.isArray(data.districts)) {
        // Create a set of existing district names for each province
        const existingDistrictsByProvince: Record<string, Set<string>> = {};
        data.districts.forEach((district: any) => {
          const provinceName = district.provinceName;
          if (!existingDistrictsByProvince[provinceName]) {
            existingDistrictsByProvince[provinceName] = new Set();
          }
          existingDistrictsByProvince[provinceName].add(district.districtName.toLowerCase());
        });

        // Filter out new districts (ones that don't exist in the database)
        const newDistricts = filledDistricts.filter(({ province, name }) => {
          const existingDistricts = existingDistrictsByProvince[province] || new Set();
          return !existingDistricts.has(name.toLowerCase());
        });

        if (newDistricts.length > 0) {
          // Get province IDs for mapping
          const provinces = await dataService.getProvince();
          const provinceMap = new Map(provinces.map(p => [p.provinceName, p.id]));

          // Create districts array for bulk creation
          const districtsToAdd = newDistricts.map(({ province, name }) => ({
            districtName: name,
            idProvince: Number(provinceMap.get(province))
          }));

          // Send new districts in bulk
          const response = await dataService.addDistrict(districtsToAdd);
          if (response && (response.status === 'success' || Array.isArray(response.data))) {
            setFormSuccess("New districts added successfully!");
          } else {
            throw new Error(response?.message || "Failed to add districts");
          }
        } else {
          setFormSuccess("Proceeding to next step...");
        }

        setDistrictStepDone(true);
        setFormError(null);
      }
    } catch (error: any) {
      console.error('Error handling districts:', error);
      if (error.response) {
        setFormError(error.response.data?.message || "Failed to add districts. Please try again.");
      } else if (error.request) {
        setFormError("No response from server. Please check your connection.");
      } else {
        setFormError(error?.message || "Failed to add districts. Please try again.");
      }
    }
  };

  // Step 3: Confirm and save
  const handleConfirm = () => {
    // Save to context (persist)
    const newDistricts = provinceNames.flatMap((province) =>
      (districtNames[province] || []).map((name) => ({
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        province,
        seats: 0,
        totalVotes: 0,
        rejectedVotes: 0,
        validVotes: 0,
        bonusSeats: 0,
        bonusSeatPartyId: null,
      }))
    );
    updateSettings?.({
      districts: [
        ...newDistricts,
        {
          id: "all-districts",
          name: "All Districts",
          province: "All",
          seats: 0,
          totalVotes: 0,
          rejectedVotes: 0,
          validVotes: 0,
          bonusSeats: 0,
          bonusSeatPartyId: null,
        },
      ],
      totalSeats: 196,
    });
    setConfirmStep(true);
    setFormSuccess("Data setup complete!");
    setFormError(null);

    // Mark setup as complete in sessionStorage
    sessionStorage.setItem(DATA_SETUP_COMPLETE_KEY, "true");
    sessionStorage.setItem(CURRENT_STEP_KEY, "confirm");
    sessionStorage.setItem(PROVINCE_STEP_DONE_KEY, "true");
    sessionStorage.setItem(DISTRICT_STEP_DONE_KEY, "true");
    setIsSetupCompleteInSession(true);
  };

  // Step navigation
  const step = confirmStep
    ? 3
    : districtStepDone
      ? 2
      : provinceStepDone
        ? 1
        : 0;

  // Helper for stepper style
  const stepCircle = (num: number, label: string) => (
    <div className="flex flex-col items-center flex-1">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
          ${step === num
            ? "border-teal-600 bg-teal-50"
            : step > num
              ? "border-green-500 bg-green-50"
              : "border-gray-300 bg-gray-50"
          }
        `}
      >
        {step > num ? (
          <svg
            className="w-6 h-6 text-green-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className={`w-6 h-6 ${step === num ? "text-teal-600" : "text-gray-400"
              }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
        )}
      </div>
      <span className="mt-2 text-xs text-center font-medium">{label}</span>
    </div>
  );

  // If confirmed, show a separate summary page
  if (isSetupCompleteInSession && confirmStep) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1
          className={`text-2xl md:text-3xl font-bold text-center ${commonStyles.title} mb-8`}
        >
          Data Setup Summary
        </h1>
        <div className="max-w-2xl mx-auto">
          <div className={`rounded-2xl shadow-xl p-8 ${commonStyles.card}`}>
            <h2 className={`${commonStyles.title} mb-6`}>
              Provinces & Districts
            </h2>
            <table className="min-w-full divide-y divide-gray-200 border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-teal-800 uppercase tracking-wider w-1/3">
                    Province
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-teal-800 uppercase tracking-wider">
                    Districts
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {provinceNames.map((province) => (
                  <tr key={province}>
                    <td className="px-6 py-4 align-top font-bold text-teal-900 text-base border-r border-gray-100 w-1/3">
                      {province}
                    </td>
                    <td className="px-6 py-4">
                      <ul className="list-disc ml-6 text-teal-800">
                        {(districtNames[province] || []).length === 0 ? (
                          <li className="text-gray-400 italic">No districts</li>
                        ) : (
                          districtNames[province].map((d, i) => (
                            <li key={i} className="py-0.5 text-base">
                              {d}
                            </li>
                          ))
                        )}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-8">
              <button
                className={commonStyles.button.primary}
                onClick={() => {
                  // Reset all session storage flags
                  sessionStorage.removeItem(DATA_SETUP_COMPLETE_KEY);
                  sessionStorage.removeItem(CURRENT_STEP_KEY);
                  sessionStorage.removeItem(PROVINCE_STEP_DONE_KEY);
                  sessionStorage.removeItem(DISTRICT_STEP_DONE_KEY);

                  // Reset component state
                  setIsSetupCompleteInSession(false);
                  setConfirmStep(false);
                  setProvinceStepDone(false);
                  setDistrictStepDone(false);

                  // Keep the existing data in the form
                  setNumberOfProvinces(provinceNames.length);
                  setProvinceNames([...provinceNames]);
                  setDistrictCounts({ ...districtCounts });
                  setDistrictNames({ ...districtNames });
                }}
              >
                Edit Setup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the stepper and forms as before if not complete in session
  return (
    <div className={commonStyles.container}>
      <div className={commonStyles.card}>
        <h1 className={commonStyles.title}>Data Setup</h1>

        {/* Add Edit/Save buttons */}
        <div className="flex justify-end mb-4">
          {isEditMode ? (
            <button
              onClick={() => setIsEditMode(false)}
              className={`${commonStyles.button.primary} mr-2`}
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => setIsEditMode(true)}
              className={`${commonStyles.button.secondary} mr-2`}
            >
              Edit
            </button>
          )}
        </div>

        {/* Stepper */}
        <div className="mb-10 flex items-center justify-center gap-0 w-full max-w-2xl mx-auto">
          {stepCircle(0, "Provinces")}
          <div
            className={`flex-1 h-0.5 ${step > 0 ? "bg-green-500" : "bg-gray-300"
              }`}
          ></div>
          {stepCircle(1, "Districts")}
          <div
            className={`flex-1 h-0.5 ${step > 1 ? "bg-green-500" : "bg-gray-300"
              }`}
          ></div>
          {stepCircle(2, "Confirm")}
        </div>
        <div className="max-w-3xl mx-auto">
          <div className={`rounded-2xl shadow-xl p-8 ${commonStyles.card}`}>
            {formError && (
              <div className={commonStyles.alert.error}>{formError}</div>
            )}
            {formSuccess && (
              <div className={commonStyles.alert.success}>{formSuccess}</div>
            )}

            {/* Step 1: Province setup */}
            {!provinceStepDone && (
              <>
                <h2 className={`${commonStyles.title} mb-6`}>Provinces Setup</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading provinces...</p>
                  </div>
                ) : (
                  <>
                    <div className={commonStyles.formGroup}>
                      <label className={commonStyles.label}>
                        Number of Provinces
                      </label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={decrementProvinceCount}
                          className={`${commonStyles.button.secondary} mr-2 ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={!isEditMode || numberOfProvinces <= 0}
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={numberOfProvinces}
                          onChange={handleProvinceCountChange}
                          onKeyDown={(e) => {
                            // Always prevent typing
                            e.preventDefault();
                          }}
                          className={`${commonStyles.input} text-center ${!isEditMode ? 'bg-gray-100' : ''}`}
                          readOnly={true}
                        />
                        <button
                          type="button"
                          onClick={incrementProvinceCount}
                          className={`${commonStyles.button.secondary} ml-2 ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={!isEditMode}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {numberOfProvinces > 0 && (
                      <div className="space-y-4">
                        {provinceNames.map((name, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <div className="flex-1">
                              <label className={commonStyles.label}>
                                Province {idx + 1}
                              </label>
                              <input
                                type="text"
                                value={name}
                                onChange={(e) =>
                                  handleProvinceNameChange(idx, e.target.value)
                                }
                                className={commonStyles.input}
                                required
                                placeholder={`Enter name for Province ${idx + 1}`}
                              />
                            </div>
                            <div className="w-48">
                              <label className={commonStyles.label}>
                                Number of Districts
                              </label>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={districtCounts[name] || ""}
                                onChange={(e) =>
                                  handleProvinceDistrictCountChange(idx, e.target.value)
                                }
                                className={commonStyles.input}
                                required
                                placeholder="Enter number"
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              {isEditMode && (
                                <>
                                  
                                  <button
                                    type="button"
                                    onClick={() => handleProvinceDelete(idx)}
                                    disabled={districtNames[name]?.length > 0}
                                    className={`p-2 text-red-600 hover:text-red-700 focus:outline-none ${districtNames[name]?.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title="Delete Province"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-8 flex justify-end">
                      <button
                        className={commonStyles.button.primary}
                        onClick={handleProvinceNext}
                      >
                        {existingProvinces.length > 0 ? "Next" : "Save and Continue"}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Step 2: District setup */}
            {provinceStepDone && !districtStepDone && (
              <>
                <h2 className={`${commonStyles.title} mb-6`}>Districts Setup</h2>
                {loadingProvinces ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading districts...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Province</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Districts</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {provinceNames.map((province) => (
                          <tr key={province}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {province}
                            </td>
                            <td className="px-6 py-4">
                              <div className="grid grid-cols-1 gap-2">
                                {Array.from({ length: districtCounts[province] || 0 }).map((_, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={districtNames[province]?.[idx] || ""}
                                      onChange={(e) =>
                                        handleDistrictNameChange(
                                          province,
                                          idx,
                                          e.target.value
                                        )
                                      }
                                      className={`${commonStyles.input} ${!isEditMode ? 'bg-gray-100' : ''}`}
                                      required
                                      readOnly={!isEditMode}
                                      placeholder={`District ${idx + 1} name`}
                                    />
                                    {isEditMode && (
                                      <button
                                        type="button"
                                        onClick={() => handleDistrictDelete(province, idx)}
                                        className="p-2 text-red-600 hover:text-red-700 focus:outline-none"
                                        title="Delete District"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="mt-8 flex justify-between">
                  <button
                    className={commonStyles.button.secondary}
                    onClick={() => setProvinceStepDone(false)}
                  >
                    Back
                  </button>
                  <button
                    className={commonStyles.button.primary}
                    onClick={handleDistrictNext}
                  >
                    {Object.values(existingDistricts).some(districts => districts.length > 0)
                      ? "Next"
                      : "Add Districts & Continue"}
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Confirmation */}
            {provinceStepDone && districtStepDone && (
              <>
                <h2 className={`${commonStyles.title} mb-6`}>
                  Confirm Data Setup
                </h2>
                <div className="mb-8">
                  <h3 className="font-semibold mb-4 text-teal-800">
                    Provinces & Districts
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {provinceNames.map((province) => (
                      <div
                        key={province}
                        className={`mb-4 border rounded-lg p-4 bg-gray-50 ${commonStyles.card}`}
                      >
                        <div
                          className={`font-semibold ${commonStyles.title} text-lg mb-2 flex items-center gap-2`}
                        >
                          <span className="inline-block w-2 h-2 rounded-full bg-teal-700"></span>
                          {province}
                        </div>
                        <ul className="ml-4 list-disc text-teal-800">
                          {(districtNames[province] || []).map((d, i) => (
                            <li key={i} className="py-0.5">
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <button
                    className={commonStyles.button.secondary}
                    onClick={() => setDistrictStepDone(false)}
                  >
                    Back
                  </button>
                  <button
                    className={commonStyles.button.primary}
                    onClick={handleConfirm}
                  >
                    Confirm & Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSetup; 