import React, { useState, useEffect } from "react";
import { useElectionData } from "../context/ElectionDataContext";

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

const DataSetup: React.FC = () => {
  const { provinces, setProvinces, districts, updateSettings } =
    useElectionData();
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

  // On mount, check if setup is complete in the current session (persisted in sessionStorage)
  // and initialize state from context or default data.
  useEffect(() => {
    const isComplete = sessionStorage.getItem(DATA_SETUP_COMPLETE_KEY) === "true";
    setIsSetupCompleteInSession(isComplete);

    if (isComplete) {
      // If setup is complete in session, load data from context to display summary
      if (provinces.length > 0 && districts.length > 0) {
         setProvinceNames(provinces);
         setNumberOfProvinces(provinces.length);
         const counts: Record<string, number> = {};
         const names: Record<string, string[]> = {};
         provinces.forEach((p) => {
           const dists = districts.filter((d) => d.province === p);
           counts[p] = dists.length;
           names[p] = dists.map((d) => d.name);
         });
         setDistrictCounts(counts);
         setDistrictNames(names);
         setConfirmStep(true); // Ensure summary is shown
      }
    } else if (provinces.length > 0) {
      // If not complete in session, initialize state based on default provinces and districts from context
      setProvinceNames(provinces);
      setNumberOfProvinces(provinces.length);
       if (districts.length > 0) {
        const counts: Record<string, number> = {};
        const names: Record<string, string[]> = {};
        provinces.forEach((p) => {
          const dists = districts.filter((d) => d.province === p);
          counts[p] = dists.length;
          names[p] = dists.map((d) => d.name);
        });
        setDistrictCounts(counts);
        setDistrictNames(names);
       }
    }
  }, [provinces, districts]); // Depend on provinces and districts from context

  // Step 1: Province setup
  const handleProvinceCountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value.replace(/[^\d]/g, ""));
    setNumberOfProvinces(isNaN(value) ? 0 : value);
    setProvinceNames(Array(isNaN(value) ? 0 : value).fill(""));
    setFormError(null);
    setFormSuccess(null);
  };
  const handleProvinceNameChange = (idx: number, value: string) => {
    const arr = [...provinceNames];
    arr[idx] = value;
    setProvinceNames(arr);
    setFormError(null);
  };
  const handleProvinceNext = () => {
    if (provinceNames.some((n) => !n.trim())) {
      setFormError("All province names must be filled");
      return;
    }
    const unique = new Set(provinceNames.map((n) => n.trim().toLowerCase()));
    if (unique.size !== provinceNames.length) {
      setFormError("Province names must be unique");
      return;
    }
    setProvinces([...provinceNames]);
    setProvinceStepDone(true);
    setFormError(null);
    setFormSuccess(null);
  };

  // Step 2: District setup
  const handleDistrictCountChange = (province: string, value: string) => {
    const v = parseInt(value.replace(/[^\d]/g, ""));
    setDistrictCounts((prev) => ({ ...prev, [province]: isNaN(v) ? 0 : v }));
    setDistrictNames((prev) => ({
      ...prev,
      [province]: Array(isNaN(v) ? 0 : v).fill(""),
    }));
    setFormError(null);
    setFormSuccess(null);
  };
  const handleDistrictNameChange = (
    province: string,
    idx: number,
    value: string
  ) => {
    setDistrictNames((prev) => {
      const arr = [...(prev[province] || [])];
      arr[idx] = value;
      return { ...prev, [province]: arr };
    });
    setFormError(null);
  };
  const handleDistrictNext = () => {
    // Check if each province has at least one district
    for (const p of provinceNames) {
      if (!districtCounts[p] || districtCounts[p] < 1) {
        setFormError(`Each province must have at least one district. Please add districts for ${p}`);
        return;
      }
    }

    // Validate all names
    for (const p of provinceNames) {
      if ((districtNames[p] || []).some((n) => !n.trim())) {
        setFormError(`All district names for ${p} must be filled`);
        return;
      }
    }

    // Check if any district name matches a province name
    const allDistrictNames = Object.values(districtNames).flat();
    for (const districtName of allDistrictNames) {
      if (provinceNames.some(province => 
        province.trim().toLowerCase() === districtName.trim().toLowerCase()
      )) {
        setFormError("District names cannot be the same as province names");
        return;
      }
    }

    // Check for duplicates across all districts
    const allNames = Object.values(districtNames).flat();
    const hasDup = allNames.some(
      (n, i) =>
        allNames.findIndex(
          (x) => x.trim().toLowerCase() === n.trim().toLowerCase()
        ) !== i
    );
    if (hasDup) {
      setFormError("District names must be unique across all provinces");
      return;
    }

    setDistrictStepDone(true);
    setFormError(null);
    setFormSuccess(null);
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
    // Mark setup as complete in sessionStorage for the current session
    sessionStorage.setItem(DATA_SETUP_COMPLETE_KEY, "true");
    setIsSetupCompleteInSession(true);
     // The districts and provinces are already saved to context by updateSettings
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
          ${
            step === num
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
            className={`w-6 h-6 ${
              step === num ? "text-teal-600" : "text-gray-400"
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
                  setConfirmStep(false);
                  setDistrictStepDone(false);
                  // Clear the completion flag in sessionStorage and state to allow re-setup
                  sessionStorage.removeItem(DATA_SETUP_COMPLETE_KEY);
                  setIsSetupCompleteInSession(false);
                   // Reset local state to initial empty state for setup steps
                   setNumberOfProvinces(0);
                   setProvinceNames([]);
                   setDistrictCounts({});
                   setDistrictNames({});
                   setProvinceStepDone(false);
                }}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the stepper and forms as before if not complete in session
  return (
    <div className="container mx-auto px-4 py-8">
      <h1
        className={`text-2xl md:text-3xl font-bold text-center ${commonStyles.title} mb-8`}
      >
        Data Setup
      </h1>
      {/* Stepper */}
      <div className="mb-10 flex items-center justify-center gap-0 w-full max-w-2xl mx-auto">
        {stepCircle(0, "Provinces")}
        <div
          className={`flex-1 h-0.5 ${
            step > 0 ? "bg-green-500" : "bg-gray-300"
          }`}
        ></div>
        {stepCircle(1, "Districts")}
        <div
          className={`flex-1 h-0.5 ${
            step > 1 ? "bg-green-500" : "bg-gray-300"
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
              <div className={commonStyles.formGroup}>
                <label className={commonStyles.label}>
                  Number of Provinces
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  min="1"
                  value={numberOfProvinces}
                  onChange={handleProvinceCountChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-lg ${commonStyles.input}`}
                  required
                  autoComplete="off"
                />
              </div>
              {numberOfProvinces > 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                  {provinceNames.map((name, idx) => (
                    <div key={idx} className="mb-4">
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
                  ))}
                </div>
              )}
              <div className="mt-8 flex justify-end">
                <button
                  className={commonStyles.button.primary}
                  onClick={handleProvinceNext}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {/* Step 2: District setup */}
          {provinceStepDone && !districtStepDone && (
            <>
              <h2 className={`${commonStyles.title} mb-6`}>Districts Setup</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {provinceNames.map((province) => (
                  <div
                    key={province}
                    className={`border rounded-xl p-6 bg-gray-50 ${commonStyles.card}`}
                  >
                    <label className={commonStyles.label}>
                      {province} - Number of Districts
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={districtCounts[province] ?? ""}
                      onChange={(e) =>
                        handleDistrictCountChange(province, e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 mb-4 ${commonStyles.input}`}
                      placeholder="Number of districts"
                      autoComplete="off"
                    />
                    {districtCounts[province] > 0 && (
                      <>
                        <h4 className={commonStyles.label}>Districts</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {Array.from({ length: districtCounts[province] }).map(
                            (_, idx) => (
                              <input
                                key={idx}
                                type="text"
                                value={districtNames[province]?.[idx] || ""}
                                onChange={(e) =>
                                  handleDistrictNameChange(
                                    province,
                                    idx,
                                    e.target.value
                                  )
                                }
                                className={commonStyles.input}
                                required
                                placeholder={`District ${idx + 1} name`}
                              />
                            )
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
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
                  Next
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
  );
};

export default DataSetup;
