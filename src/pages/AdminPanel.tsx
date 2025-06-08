import React, { useState, useEffect } from "react";
import { useElectionData } from "../context/ElectionDataContext";
import { Party, District } from "../types";
import { Edit2, Trash2, CheckCircle2, Circle } from "lucide-react";
import { ElectionHistory, electionHistory } from "../data/electionHistory";
import ConfigureElectionProvincesDistricts from "../components/ConfigureElectionProvincesDistricts";
import ConfirmElectionProvincesDistricts from "../components/ConfirmElectionProvincesDistricts";
import { dataService } from '../utils/dataService';

// Define the interfaces used within AdminPanel.tsx (including SetSeatCounts)
interface ProvinceConfig {
  name: string;
  districts: DistrictConfig[];
}

// Modified DistrictConfig to include province
interface DistrictConfig extends District {
  // No need to omit province here as we need it in this file
}

const AdminPanel: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const isReload = !sessionStorage.getItem('adminPanelVisited');
    if (isReload) {
      sessionStorage.setItem('adminPanelVisited', 'true');
      localStorage.setItem("adminPanelStep", "1");
      return 1;
    }
    const savedStep = localStorage.getItem("adminPanelStep");
    return savedStep ? parseInt(savedStep) : 1;
  });
  const { year, setYear, districts, updateSettings, provinces, setProvinces } =
    useElectionData();

  // Add state to track if election was created
  const [electionCreated, setElectionCreated] = useState(false);

  // Save current step to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("adminPanelStep", currentStep.toString());
  }, [currentStep]);

  // Check if each step is completed
  const isStepCompleted = {
    step1: year >= 2025 && provinces.length > 0, // Only completed if year is 2025 or later, provinces are configured, and election is created
    step2: districts.length > 0, // Only completed if districts are configured
    step3: districts.length > 0, // Only completed if districts are configured
    step4: districts.length > 0, // Only completed if districts have seats configured
  };

  const steps = [
    {
      id: 1,
      title: "Create Election",
      description: "Choose the election year",
      component: (
        <SelectElectionYear
          selectedYear={year}
          setSelectedYear={setYear}
          onElectionCreated={() => setElectionCreated(true)}
        />
      ),
      isCompleted: isStepCompleted.step1,
    },
    {
      id: 2,
      title: "Configure Provinces & Districts for Year",
      description:
        "Select and modify provinces and districts for the selected election year",
      component: <ConfigureElectionProvincesDistricts />,
      isCompleted: isStepCompleted.step2,
    },
    {
      id: 3,
      title: "Confirm Provinces & Districts",
      description: "Review the configured provinces and districts",
      component: <ConfirmElectionProvincesDistricts />,
      isCompleted: isStepCompleted.step3,
    },
    {
      id: 4,
      title: "Set Seat Counts",
      description: "Configure total parliament seats",
      component: <SetSeatCounts />,
      isCompleted: isStepCompleted.step4,
    },
  ];

  // Prevent out-of-bounds currentStep
  const safeCurrentStep = Math.max(1, Math.min(currentStep, steps.length));

  // Function to check if next step is available
  const canProceedToNextStep = () => {
    if (currentStep >= steps.length) return false;
    return isStepCompleted[`step${currentStep}` as keyof typeof isStepCompleted];
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <h1 className="text-2xl md:text-3xl font-bold text-center text-teal-800 mb-8">
        Election Administration - {year}
      </h1>

      {/* Steps Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep === step.id
                    ? "border-teal-600 bg-teal-50"
                    : step.isCompleted
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 bg-gray-50"
                    }`}
                >
                  {step.isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <span className="text-xs mt-2 text-center font-medium">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 ${step.isCompleted ? "bg-green-500" : "bg-gray-300"
                    }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Navigation */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-md ${currentStep === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-teal-600 text-white hover:bg-teal-700"
              }`}
          >
            Previous Step
          </button>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {steps[currentStep - 1 < steps.length ? currentStep - 1 : 0]
                ?.title || ""}
            </h2>
            <p className="text-sm text-gray-600">
              {steps[currentStep - 1 < steps.length ? currentStep - 1 : 0]
                ?.description || ""}
            </p>
          </div>
          <button
            onClick={() =>
              setCurrentStep((prev) => Math.min(steps.length, prev + 1))
            }
            disabled={!canProceedToNextStep()}
            className={`px-4 py-2 rounded-md ${!canProceedToNextStep()
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-teal-600 text-white hover:bg-teal-700"
              }`}
          >
            Next Step
          </button>
        </div>
      </div>

      {/* Current Step Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-teal-800">
          {steps[currentStep - 1 < steps.length ? currentStep - 1 : 0]
            ?.component || null}
        </div>
      </div>
    </div>
  );
};

// Select Election Year Component
const SelectElectionYear: React.FC<{
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  onElectionCreated: () => void;
}> = ({ selectedYear, setSelectedYear, onElectionCreated }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<ElectionHistory | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showProvinceInput, setShowProvinceInput] = useState(false);
  const [numberOfProvinces, setNumberOfProvinces] = useState<string>("");
  const { provinces } = useElectionData(); // Get provinces from context

  // Local state for manual-only input
  const [yearInput, setYearInput] = useState(selectedYear ? String(selectedYear) : "");

  // Effect to initialize province count when returning to this step
  useEffect(() => {
    if (selectedYear >= 2025 && provinces.length > 0) {
      setShowProvinceInput(true);
      setNumberOfProvinces(String(provinces.length));
    }
  }, [selectedYear, provinces]);

  useEffect(() => {
    setYearInput(selectedYear ? String(selectedYear) : "");
  }, [selectedYear]);

  const handleYearInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYearInput(e.target.value.replace(/[^\d]/g, ""));
    setError(null);
    setSuccessMessage(null);
    setShowProvinceInput(false);
  };

  const handleSetYear = async () => {
    const value = parseInt(yearInput);
    if (!isNaN(value)) {
      // First check if there's historical data for this year
      const history = electionHistory.find((h) => h.year === value);

      if (value < 2025) {
        if (history) {
          setSelectedHistory(history);
          setError(null);
          setShowProvinceInput(false);
        } else {
          setError("No parliamentary election was held in this year.");
        }
        return;
      }

      // For years 2025 and later
      setSelectedYear(value);
      setShowProvinceInput(true);
      setError(null);
      setSuccessMessage(null);
      setSelectedHistory(null);

      // If we already have provinces configured, show their count
      if (provinces.length > 0) {
        setNumberOfProvinces(String(provinces.length));
      }
    }
  };

  const handleCreateElection = async () => {
    if (!numberOfProvinces || parseInt(numberOfProvinces) <= 0) {
      setError("Please enter a valid number of provinces");
      return;
    }

    setIsSaving(true);
    try {
      const electionData = {
        electionYear: parseInt(yearInput),
        noOfProvinces: parseInt(numberOfProvinces),
        totalSeats: 0 // Will be updated in later steps
      };

      const response = await fetch('http://localhost:8000/election/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([electionData]) // API expects an array
      });

      const result = await response.json();

      if (response.ok) {
        // Store the number of provinces in localStorage to persist it
        localStorage.setItem('numberOfProvinces', numberOfProvinces);
        setSuccessMessage(`Election for year ${yearInput} created successfully!`);
        setTimeout(() => setSuccessMessage(null), 1000);
        onElectionCreated();
      } else {
        setError(result.message || "Failed to create election");
        setTimeout(() => setError(null), 1000);
      }
    } catch (error: any) {
      console.error('Error creating election:', error);
      setError(error.message || "Failed to create election");
      setTimeout(() => setError(null), 1000);
    } finally {
      setIsSaving(false);
    }
  };

  // Add useEffect to load persisted numberOfProvinces
  useEffect(() => {
    const savedNumberOfProvinces = localStorage.getItem('numberOfProvinces');
    if (savedNumberOfProvinces) {
      setNumberOfProvinces(savedNumberOfProvinces);
    }
  }, []);

  return (
    <div className={commonStyles.container}>
      <div className={commonStyles.card}>
        <h2 className={commonStyles.title}>Create Election</h2>

        <div className="mb-6">
          <label className={commonStyles.label}>Enter the election year</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              inputMode="numeric"
              value={yearInput}
              onChange={handleYearInputChange}
              className={commonStyles.input}
              placeholder="Enter year"
              autoComplete="off"
              disabled={isSaving}
            />
            <button
              onClick={handleSetYear}
              disabled={isSaving}
              className={`${commonStyles.button.primary} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Continue
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {successMessage && <p className="mt-2 text-sm text-green-600">{successMessage}</p>}
        </div>

        {selectedHistory && (
          <div className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
            <h3 className="text-lg font-semibold text-teal-800 mb-2">
              {selectedHistory.parliamentNumber} Election
            </h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Election Dates:</span>{" "}
                {selectedHistory.electionDates}
              </p>
              <p>
                <span className="font-medium">Notable Outcomes:</span>{" "}
                {selectedHistory.notableOutcomes}
              </p>
            </div>
          </div>
        )}

        {showProvinceInput && (
          <div className="mb-6">
            <label className={commonStyles.label}>Number of Provinces</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                inputMode="numeric"
                value={numberOfProvinces}
                onChange={(e) => setNumberOfProvinces(e.target.value.replace(/[^\d]/g, ""))}
                className={commonStyles.input}
                placeholder="Enter number of provinces"
                autoComplete="off"
                disabled={isSaving}
              />
              {provinces.length > 0 && (
                <p className="mt-2 text-sm text-teal-600">
                  {provinces.length} provinces already configured
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="text-teal-600 hover:text-teal-800 text-sm font-medium"
          >
            {showHistory ? "Hide Election History" : "Show Election History"}
          </button>
        </div>

        {showHistory && (
          <div className="mt-4 overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parliament
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Election Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notable Outcomes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {electionHistory.map((election) => (
                  <tr
                    key={`${election.year}-${election.parliamentNumber}`}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setYearInput(String(election.year));
                      handleSetYear();
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {election.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {election.parliamentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {election.electionDates}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {election.notableOutcomes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showProvinceInput && (
          <div className="flex justify-end mt-6">
            <button
              onClick={handleCreateElection}
              disabled={isSaving}
              className={`${commonStyles.button.primary} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaving ? 'Creating...' : 'Create Election'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Common styles for all step components
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

// Manage Districts Component (Step 3)
const ManageDistricts: React.FC = () => {
  const { districts, updateSettings, provinces } = useElectionData();
  const [districtCounts, setDistrictCounts] = useState<Record<string, number>>(
    {}
  );
  const [districtNames, setDistrictNames] = useState<Record<string, string[]>>(
    {}
  );
  const [currentStep, setCurrentStep] = useState<"count" | "names">("count");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Initialize or load existing district data
  useEffect(() => {
    if (districts.length > 0) {
      // Group existing districts by province
      const existingCounts: Record<string, number> = {};
      const existingNames: Record<string, string[]> = {};

      // Initialize with 0 for all provinces
      provinces.forEach((province) => {
        existingCounts[province] = 0;
        existingNames[province] = [];
      });

      // Fill in existing data
      districts.forEach((district) => {
        if (district.id !== "all-districts") {
          existingCounts[district.province] =
            (existingCounts[district.province] || 0) + 1;
          existingNames[district.province] = [
            ...(existingNames[district.province] || []),
            district.name,
          ];
        }
      });

      setDistrictCounts(existingCounts);
      setDistrictNames(existingNames);

      // If we have existing districts, go directly to names step
      if (Object.values(existingCounts).some((count) => count > 0)) {
        setCurrentStep("names");
      }
    } else {
      // Initialize empty if no districts exist
      const initialCounts: Record<string, number> = {};
      const initialNames: Record<string, string[]> = {};
      provinces.forEach((province) => {
        initialCounts[province] = 0;
        initialNames[province] = [];
      });
      setDistrictCounts(initialCounts);
      setDistrictNames(initialNames);
    }
  }, [provinces, districts]);

  // Local state for manual-only district count input
  const [districtCountInputs, setDistrictCountInputs] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    // Sync local input state with districtCounts
    setDistrictCountInputs(
      Object.fromEntries(
        Object.entries(districtCounts).map(([province, count]) => [
          province,
          count === 0 ? "" : String(count),
        ])
      )
    );
  }, [districtCounts]);

  const handleDistrictCountInputChange = (province: string, value: string) => {
    setDistrictCountInputs((prev) => ({
      ...prev,
      [province]: value.replace(/[^\d]/g, ""),
    }));
  };

  const commitDistrictCountInput = (province: string) => {
    const value = districtCountInputs[province];
    if (value === undefined) return;
    if (value === "") {
      setDistrictCounts((prev) => ({ ...prev, [province]: 0 }));
      setDistrictNames((prev) => ({ ...prev, [province]: [] }));
    } else if (/^\d+$/.test(value)) {
      setDistrictCounts((prev) => ({ ...prev, [province]: parseInt(value) }));
      setDistrictNames((prev) => ({
        ...prev,
        [province]: Array(parseInt(value)).fill(""),
      }));
    }
  };

  const handleDistrictNameChange = (
    province: string,
    index: number,
    name: string
  ) => {
    // Simply update the name without any validation
    setDistrictNames((prev) => {
      const newNames = [...prev[province]];
      newNames[index] = name;
      return {
        ...prev,
        [province]: newNames,
      };
    });
    setFormError(null);
  };

  const handleCountSubmit = () => {
    // Validate that at least one province has districts
    const hasDistricts = Object.values(districtCounts).some(
      (count) => count > 0
    );
    if (!hasDistricts) {
      setFormError("Please specify at least one district for any province");
      return;
    }
    setCurrentStep("names");
    setFormError(null);
  };

  const handleNamesSubmit = () => {
    // Validate all district names are filled
    const allNamesFilled = Object.entries(districtNames).every(
      ([province, names]) => {
        return names.every((name) => name.trim() !== "");
      }
    );

    if (!allNamesFilled) {
      setFormError("Please fill in all district names");
      return;
    }

    // Check for duplicates across all provinces
    const allDistrictNames = Object.values(districtNames).flat();
    const hasDuplicate = allDistrictNames.some((name, index) => {
      // Skip pure number names
      if (/^\d+$/.test(name)) return false;

      // Check for case-insensitive duplicates of non-number names
      return allDistrictNames.some((otherName, otherIndex) => {
        if (index === otherIndex) return false;
        if (/^\d+$/.test(otherName)) return false;
        return name.toLowerCase() === otherName.toLowerCase();
      });
    });

    if (hasDuplicate) {
      setFormError(
        "Duplicate district names are not allowed across provinces (case-insensitive)"
      );
      return;
    }

    // Create districts array
    const newDistricts = Object.entries(districtNames).flatMap(
      ([province, names]) => {
        return names.map((name) => ({
          id: name.toLowerCase().replace(/\s+/g, "-"),
          name: name,
          province: province,
          seats: 0,
          totalVotes: 0,
          rejectedVotes: 0,
          validVotes: 0,
          bonusSeats: 0,
          bonusSeatPartyId: null,
        }));
      }
    );

    // Add the "all-districts" entry
    const updatedDistricts = [
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
    ];

    updateSettings?.({
      districts: updatedDistricts,
      totalSeats: 196,
    });

    setFormSuccess("Districts configured successfully");
    setTimeout(() => setFormSuccess(null), 1000);
  };

  return (
    <div className={commonStyles.container}>
      <div className={commonStyles.card}>
        <h2 className={commonStyles.title}>Configure Districts by Province</h2>

        {formError && (
          <div className={commonStyles.alert.error}>{formError}</div>
        )}

        {formSuccess && (
          <div className={commonStyles.alert.success}>{formSuccess}</div>
        )}

        {currentStep === "count" ? (
          // Step 1: Enter number of districts per province
          <div>
            <h3 className="text-lg font-semibold text-teal-800 mb-4">
              Enter Number of Districts for Each Province
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {provinces.map((province) => (
                <div key={province} className="border rounded-lg p-4">
                  <label className={commonStyles.label}>{province}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={districtCountInputs[province] ?? ""}
                    onChange={(e) =>
                      handleDistrictCountInputChange(province, e.target.value)
                    }
                    onBlur={() => commitDistrictCountInput(province)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitDistrictCountInput(province);
                    }}
                    className={commonStyles.input}
                    placeholder="Number of districts"
                    autoComplete="off"
                  />
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button
                onClick={handleCountSubmit}
                className={commonStyles.button.primary}
              >
                Continue to Enter District Names
              </button>
            </div>
          </div>
        ) : (
          // Step 2: Enter district names
          <div>
            <h3 className="text-lg font-semibold text-teal-800 mb-4">
              Enter District Names
            </h3>
            <div className="space-y-6">
              {provinces.map(
                (province) =>
                  districtCounts[province] > 0 && (
                    <div key={province} className="border rounded-lg p-4">
                      <h4 className="font-medium text-teal-800 mb-3">
                        {province} Districts
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: districtCounts[province] }).map(
                          (_, index) => (
                            <div key={index}>
                              <label className={commonStyles.label}>
                                District {index + 1}
                              </label>
                              <input
                                type="text"
                                value={districtNames[province][index] || ""}
                                onChange={(e) =>
                                  handleDistrictNameChange(
                                    province,
                                    index,
                                    e.target.value
                                  )
                                }
                                className={commonStyles.input}
                                placeholder={`Enter district name ${index + 1}`}
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )
              )}
            </div>
            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => setCurrentStep("count")}
                className={commonStyles.button.secondary}
              >
                Back to District Counts
              </button>
              <button
                onClick={handleNamesSubmit}
                className={commonStyles.button.primary}
              >
                Save District Configuration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Manage Parties Component (no district selection)
const ManageParties: React.FC = () => {
  const { parties, addParty, updateParty, deleteParty } = useElectionData();
  const [formData, setFormData] = useState<{
    id: string | null;
    name: string;
    logoData?: string;
    districtId: string;
  }>({
    id: null,
    name: "",
    logoData: undefined,
    districtId: "all-districts", // Default district ID
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [partyToDelete, setPartyToDelete] = useState<Party | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "seats" ? parseInt(value) || 0 : value,
    }));
    setFormError(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const dataUrl = await toBase64(file);
      setFormData((prev) => ({ ...prev, logoData: dataUrl }));
    }
  };

  function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError("Party name is required");
      return false;
    }
    if (!formData.logoData) {
      setFormError("Party logo is required");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Prevent duplicate party names (case-insensitive)
    const nameExists = parties.some(
      (p) =>
        p.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
        p.id !== formData.id
    );
    if (nameExists) {
      setFormError("A party with this name already exists.");
      return;
    }

    if (formData.id) {
      // Update existing party
      const existingParty = parties.find((p) => p.id === formData.id);
      if (existingParty) {
        updateParty({
          ...existingParty,
          name: formData.name,
          logoData: formData.logoData,
        });
        setFormSuccess("Party updated successfully");
      }
    } else {
      // Add new party
      addParty({
        name: formData.name,
        votes: 0,
        logoData: formData.logoData,
        districtId: formData.districtId,
      });
      setFormSuccess("Party added successfully");
    }
    // } else {
    //   // Add new party
    //   try {
    //     await axios.post(
    //       "https://68369c7d664e72d28e416510.mockapi.io/api/v1/parties",
    //       {
    //         name: formData.name,
    //       }
    //     );
    //     setFormSuccess("Party added successfully");
    //   } catch (error) {
    //     setFormError("Failed to add party");
    //   }
    // }
    // Reset form
    setFormData({
      id: null,
      name: "",
      logoData: undefined,
      districtId: "all-districts",
    });

    // Clear success message after 3 seconds
    setTimeout(() => {
      setFormSuccess(null);
    }, 1000);
  };

  const handleEdit = (party: Party) => {
    setFormData({
      id: party.id,
      name: party.name,
      logoData: party.logoData,
      districtId: party.districtId,
    });
    setFormError(null);
  };

  const handleDelete = (party: Party) => {
    setPartyToDelete(party);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (partyToDelete) {
      deleteParty(partyToDelete.id);
      setFormSuccess("Party deleted successfully");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setFormSuccess(null);
      }, 1000);
    }
    setDeleteModalOpen(false);
    setPartyToDelete(null);
  };

  const handleClear = () => {
    setFormData({
      id: null,
      name: "",
      logoData: undefined,
      districtId: "all-districts",
    });
    setFormError(null);
  };

  return (
    <div className={commonStyles.container}>
      {/* Form */}
      <div className={commonStyles.card}>
        <h2 className={commonStyles.title}>
          {formData.id ? "Edit Party" : "Add Party"}
        </h2>

        {formError && (
          <div className={commonStyles.alert.error}>{formError}</div>
        )}

        {formSuccess && (
          <div className={commonStyles.alert.success}>{formSuccess}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label htmlFor="name" className={commonStyles.label}>
                Party Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={commonStyles.input}
                required
              />
            </div>

            <div>
              <label htmlFor="logoData" className={commonStyles.label}>
                Party Logo File
              </label>
              <div className="flex items-center">
                <input
                  type="file"
                  id="logoData"
                  name="logoData"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={commonStyles.input}
                />
                {formData.logoData && (
                  <img
                    src={formData.logoData}
                    alt="Logo preview"
                    className="w-10 h-10 ml-2 object-contain"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button type="submit" className={commonStyles.button.primary}>
              {formData.id ? "Update Party" : "Add Party"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className={commonStyles.button.secondary}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className={commonStyles.table.container}>
        <h2 className={commonStyles.title}>Party List</h2>
        <table className={commonStyles.table.table}>
          <thead className={commonStyles.table.header}>
            <tr>
              <th className={commonStyles.table.headerCell}>Party Name</th>
              <th className={commonStyles.table.headerCell}>Logo</th>
              <th className={commonStyles.table.headerCell}>Actions</th>
            </tr>
          </thead>
          <tbody className={commonStyles.table.body}>
            {parties.map((party) => (
              <tr key={party.id} className={commonStyles.table.row}>
                <td className={commonStyles.table.cell}>
                  <div className="text-sm font-medium text-gray-900">
                    {party.name}
                  </div>
                </td>
                <td className={commonStyles.table.cell}>
                  <img
                    src={party.logoData}
                    alt={`${party.name} logo`}
                    className="w-8 h-8 object-contain"
                  />
                </td>
                <td className={commonStyles.table.cell}>
                  <button
                    onClick={() => handleEdit(party)}
                    className={commonStyles.button.primary}
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(party)}
                    className={commonStyles.button.danger}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-teal-800">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="mb-4">
              Are you sure you want to delete {partyToDelete?.name}? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className={commonStyles.button.secondary}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className={commonStyles.button.danger}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Assign Parties to Districts Component
const AssignPartiesToDistricts: React.FC = () => {
  const { districts, parties, districtNominations, setDistrictNominations } =
    useElectionData();
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Filter out the 'all-districts' option
  const districtOptions = districts.filter((d) => d.id !== "all-districts");

  // Handler for checkbox change per district
  const handleCheck = (districtId: string, partyId: string) => {
    const nominated = districtNominations[districtId] || [];
    let updated: string[];
    if (nominated.includes(partyId)) {
      updated = nominated.filter((id) => id !== partyId);
    } else {
      updated = [...nominated, partyId];
    }
    setDistrictNominations(districtId, updated);
    setFormSuccess(
      `Nominations updated for ${districts.find((d) => d.id === districtId)?.name
      }`
    );
    setTimeout(() => setFormSuccess(null), 1000);
  };

  return (
    <div className={commonStyles.container}>
      <h2 className={commonStyles.title}>Assign Parties to Districts</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {districtOptions.map((district) => {
          const nominated = districtNominations[district.id] || [];
          return (
            <div
              key={district.id}
              className="bg-white border rounded-lg shadow p-4 mb-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-teal-800">
                  {district.name}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${nominated.length > 0
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-200 text-gray-600"
                    }`}
                >
                  {nominated.length > 0
                    ? `${nominated.length} assigned`
                    : "Not assigned"}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {parties.length === 0 ? (
                  <span className="text-gray-400 text-sm">
                    No parties available
                  </span>
                ) : (
                  parties.map((party) => (
                    <label
                      key={party.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1"
                    >
                      <input
                        type="checkbox"
                        checked={nominated.includes(party.id)}
                        onChange={() => handleCheck(district.id, party.id)}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      {party.logoData && (
                        <img
                          src={party.logoData}
                          alt={party.name}
                          className="h-5 w-5 rounded-full object-cover"
                        />
                      )}
                      <span className="text-sm">{party.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Success Message */}
      {formSuccess && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md text-center">
          {formSuccess}
        </div>
      )}

      {/* Progress Summary */}
      <div className="mt-8">
        <h3 className={commonStyles.label}>Assignment Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {districtOptions.map((district) => {
            const nominated = districtNominations[district.id] || [];
            const isComplete = nominated.length > 0;
            const nominatedParties = parties.filter((p) =>
              nominated.includes(p.id)
            );
            return (
              <div
                key={district.id}
                className={`p-4 border rounded-lg ${isComplete ? "bg-green-50 border-green-200" : "bg-gray-50"
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    {district.name}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${isComplete
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    {isComplete
                      ? `${nominated.length} parties nominated`
                      : "Not assigned"}
                  </span>
                </div>

                {isComplete && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-600">
                      Nominated Parties:
                    </span>
                    <ul className="list-disc ml-5 mt-1">
                      {nominatedParties.map((p) => (
                        <li key={p.id} className="text-xs text-gray-800">
                          {p.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Configure Provinces Component
const ConfigureProvinces: React.FC = () => {
  const { provinces, setProvinces } = useElectionData();
  const [numberOfProvinces, setNumberOfProvinces] = useState<number>(
    provinces.length
  );
  const [provinceNames, setProvinceNames] = useState<string[]>(provinces);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Local state for manual-only province count input
  const [provinceCountInput, setProvinceCountInput] = useState<string>(
    numberOfProvinces ? String(numberOfProvinces) : ""
  );

  useEffect(() => {
    setProvinceCountInput(numberOfProvinces ? String(numberOfProvinces) : "");
  }, [numberOfProvinces]);

  const handleProvinceCountInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProvinceCountInput(e.target.value.replace(/[^\d]/g, ""));
  };

  const commitProvinceCountInput = () => {
    const value = parseInt(provinceCountInput);
    if (!isNaN(value) && value >= 0) {
      setNumberOfProvinces(value);
      setProvinceNames(Array(value).fill(""));
      setFormError(null);
    }
  };

  const handleProvinceNameChange = (index: number, value: string) => {
    const newProvinceNames = [...provinceNames];
    newProvinceNames[index] = value;
    setProvinceNames(newProvinceNames);
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate province names
    if (provinceNames.some((name) => !name.trim())) {
      setFormError("All province names must be filled");
      return;
    }

    // Check for duplicate names
    const uniqueNames = new Set(
      provinceNames.map((name) => name.toLowerCase().trim())
    );
    if (uniqueNames.size !== provinceNames.length) {
      setFormError("Province names must be unique");
      return;
    }

    // Save the provinces to context
    setProvinces([...provinceNames]);
    setFormSuccess("Provinces saved successfully");
    setIsEditing(false);
    setTimeout(() => setFormSuccess(null), 1000);
  };

  const handleEdit = () => {
    setProvinceNames([...provinces]);
    setNumberOfProvinces(provinces.length);
    setIsEditing(true);
  };

  const handleDelete = (index: number) => {
    const newProvinces = provinces.filter((_, i) => i !== index);
    setProvinces(newProvinces);
    setProvinceNames(newProvinces);
    setNumberOfProvinces(newProvinces.length);
    setFormSuccess("Province deleted successfully");
    setTimeout(() => setFormSuccess(null), 1000);
  };

  const handleAddMore = () => {
    setIsEditing(true);
    setProvinceNames([...provinces, ""]);
    setNumberOfProvinces(provinces.length + 1);
  };

  return (
    <div className={commonStyles.container}>
      <div className={commonStyles.card}>
        <h2 className={commonStyles.title}>Configure Provinces</h2>

        {formError && (
          <div className={commonStyles.alert.error}>{formError}</div>
        )}

        {formSuccess && (
          <div className={commonStyles.alert.success}>{formSuccess}</div>
        )}

        {provinces.length > 0 && !isEditing && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-teal-800">
                Saved Provinces ({provinces.length})
              </h3>
              <div className="space-x-2">
                <button
                  onClick={handleEdit}
                  className={commonStyles.button.primary}
                >
                  Edit Provinces
                </button>
                <button
                  onClick={handleAddMore}
                  className={commonStyles.button.secondary}
                >
                  Add More
                </button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {provinces.map((province, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm"
                  >
                    <span className="font-medium text-gray-700">
                      {province}
                    </span>
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete province"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(isEditing || provinces.length === 0) && (
          <form onSubmit={handleSubmit}>
            <div className={commonStyles.formGroup}>
              <label htmlFor="numberOfProvinces" className={commonStyles.label}>
                Number of Provinces
              </label>
              <input
                type="text"
                inputMode="numeric"
                id="numberOfProvinces"
                min="1"
                value={provinceCountInput}
                onChange={handleProvinceCountInputChange}
                onBlur={commitProvinceCountInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitProvinceCountInput();
                }}
                className={commonStyles.input}
                required
                autoComplete="off"
              />
            </div>

            {numberOfProvinces > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-teal-800 mb-4">
                  Enter Province Names
                </h3>
                <div className="space-y-4">
                  {provinceNames.map((name, index) => (
                    <div key={index} className={commonStyles.formGroup}>
                      <label
                        htmlFor={`province-${index}`}
                        className={commonStyles.label}
                      >
                        Province {index + 1}
                      </label>
                      <input
                        type="text"
                        id={`province-${index}`}
                        value={name}
                        onChange={(e) =>
                          handleProvinceNameChange(index, e.target.value)
                        }
                        className={commonStyles.input}
                        required
                        placeholder={`Enter name for Province ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex space-x-4">
              <button type="submit" className={commonStyles.button.primary}>
                {isEditing ? "Update Provinces" : "Save Provinces"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setProvinceNames([...provinces]);
                    setNumberOfProvinces(provinces.length);
                  }}
                  className={commonStyles.button.secondary}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Set Seat Counts Component
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
        })) // Add province name here
    )
    : [];

  // Remove the useEffect that initializes districtSeatInputs (since context will persist it)

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
        })) // Add province name here again for saving
    );

    // Include the 'all-districts' placeholder if it exists in the original districts
    const allDistrictsPlaceholder = globalDistricts.find(
      (d) => d.id === "all-districts"
    );
    const finalDistrictsToSave = allDistrictsPlaceholder
      ? [...updatedDistrictsFlat, allDistrictsPlaceholder]
      : updatedDistrictsFlat;

    updateSettings?.({
      districts: finalDistrictsToSave, // Pass the updated flattened list
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
    setTimeout(() => setFormSuccess(null), 1000);
  };

  // If no districts are configured yet for the year, show a message
  if (!yearConfig || configuredDistricts.length === 0) {
    return (
      <div className={commonStyles.container}>
        <div className={commonStyles.card}>
          <h2 className={commonStyles.title}>Configure Parliament Seats</h2>
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
    <div className={commonStyles.container}>
      <div className={commonStyles.card}>
        <h2 className={commonStyles.title}>Configure Parliament Seats</h2>

        {formError && (
          <div className={commonStyles.alert.error}>{formError}</div>
        )}

        {formSuccess && (
          <div className={commonStyles.alert.success}>{formSuccess}</div>
        )}

        <div className="space-y-8">
          {/* Total Seats Section */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-teal-800 mb-4">
              Total Parliament Seats
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
                      {/* Display province name */}
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
              className={commonStyles.button.primary}
            >
              Save Seat Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
