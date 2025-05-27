import React, { useState, useEffect } from "react";
import { useElectionData } from "../context/ElectionDataContext";
import { Party, DistrictVote, District } from "../types";
import {
  Edit2,
  Trash2,
  Settings as SettingsIcon,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { initialDistricts } from "../data/mockData";
import { provinces } from "../data/mockData";

// Pre-configured districts data
const defaultDistricts: District[] = [
  {
    id: "colombo",
    name: "Colombo",
    province: "Western",
    seats: 22,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "gampaha",
    name: "Gampaha",
    province: "Western",
    seats: 20,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "kalutara",
    name: "Kalutara",
    province: "Western",
    seats: 15,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "kandy",
    name: "Kandy",
    province: "Central",
    seats: 12,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "matale",
    name: "Matale",
    province: "Central",
    seats: 8,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "nuwara-eliya",
    name: "Nuwara Eliya",
    province: "Central",
    seats: 9,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "galle",
    name: "Galle",
    province: "Southern",
    seats: 10,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "matara",
    name: "Matara",
    province: "Southern",
    seats: 9,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "hambantota",
    name: "Hambantota",
    province: "Southern",
    seats: 8,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "jaffna",
    name: "Jaffna",
    province: "Northern",
    seats: 10,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "vanni",
    name: "Vanni",
    province: "Northern",
    seats: 6,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "batticaloa",
    name: "Batticaloa",
    province: "Eastern",
    seats: 8,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "ampara",
    name: "Ampara (Digamadulla)",
    province: "Eastern",
    seats: 9,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "trincomalee",
    name: "Trincomalee",
    province: "Eastern",
    seats: 7,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "kurunegala",
    name: "Kurunegala",
    province: "North-Western",
    seats: 15,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "puttalam",
    name: "Puttalam",
    province: "North-Western",
    seats: 9,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "anuradhapura",
    name: "Anuradhapura",
    province: "North-Central",
    seats: 11,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "polonnaruwa",
    name: "Polonnaruwa",
    province: "North-Central",
    seats: 8,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "badulla",
    name: "Badulla",
    province: "Uva",
    seats: 9,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "monaragala",
    name: "Monaragala",
    province: "Uva",
    seats: 7,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "ratnapura",
    name: "Ratnapura",
    province: "Sabaragamuwa",
    seats: 9,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
  {
    id: "kegalle",
    name: "Kegalle",
    province: "Sabaragamuwa",
    seats: 8,
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null,
  },
];

const AdminPanel: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const savedStep = localStorage.getItem("adminPanelStep");
    return savedStep ? parseInt(savedStep) : 1;
  });
  const {
    year,
    setYear,
    districts,
    parties,
    districtNominations,
    updateSettings,
    electionStats,
  } = useElectionData();
  const navigate = useNavigate();

  // Save current step to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("adminPanelStep", currentStep.toString());
  }, [currentStep]);

  // Add all default districts on component mount
  useEffect(() => {
    // Add all default districts if none exist
    if (districts.length === 0) {
      updateSettings?.({
        districts: initialDistricts,
        totalSeats: 225,
      });
    }
  }, []); // Empty dependency array means this runs once on mount

  // Check if each step is completed
  const isStepCompleted = {
    step1: true, // Year selection is always completed
    step2: districts.length > 1, // More than just "all-districts"
    step3: true, // Always show as completed like step 1
    step4: true, // Always show as completed like step 1
  };

  const steps = [
    {
      id: 1,
      title: "Select Election Year",
      description: "Choose the election year",
      component: (
        <SelectElectionYear selectedYear={year} setSelectedYear={setYear} />
      ),
      isCompleted: isStepCompleted.step1,
    },
    {
      id: 2,
      title: "Configure Districts",
      description: "Set up districts and allocate seats",
      component: <ManageDistricts />,
      isCompleted: isStepCompleted.step2,
    },
    {
      id: 3,
      title: "Add Parties",
      description: "Register political parties",
      component: <ManageParties />,
      isCompleted: isStepCompleted.step3,
    },
    {
      id: 4,
      title: "Assign Parties to Districts",
      description: "Nominate parties for each district",
      component: <AssignPartiesToDistricts />,
      isCompleted: isStepCompleted.step4,
    },
  ];

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
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep === step.id
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
                  className={`flex-1 h-0.5 ${
                    step.isCompleted ? "bg-green-500" : "bg-gray-300"
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
            className={`px-4 py-2 rounded-md ${
              currentStep === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-teal-600 text-white hover:bg-teal-700"
            }`}
          >
            Previous Step
          </button>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-sm text-gray-600">
              {steps[currentStep - 1].description}
            </p>
          </div>
          <button
            onClick={() =>
              setCurrentStep((prev) => Math.min(steps.length, prev + 1))
            }
            disabled={currentStep === steps.length}
            className={`px-4 py-2 rounded-md ${
              currentStep === steps.length
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
          {steps[currentStep - 1].component}
        </div>
      </div>
    </div>
  );
};

// Select Election Year Component
const SelectElectionYear: React.FC<{
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}> = ({ selectedYear, setSelectedYear }) => {
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 2025) {
      setSelectedYear(value);
    }
  };

  return (
    <div className={commonStyles.container}>
      <div className={commonStyles.card}>
        <h2 className={commonStyles.title}>Select Election Year</h2>
        <div className="mb-6">
          <label className={commonStyles.label}>Enter the election year</label>
          <input
            type="number"
            min="2025"
            value={selectedYear}
            onChange={handleYearChange}
            className={commonStyles.input}
            placeholder="Enter year (2025 or later)"
          />
        </div>
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

// Manage Districts Component (Step 1)
const ManageDistricts: React.FC = () => {
  const { districts, updateSettings, electionStats } = useElectionData();
  const [formData, setFormData] = useState<{
    name: string;
    province: string;
    seats: number;
  }>({
    name: "",
    province: "",
    seats: 0,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [totalSeats, setTotalSeats] = useState<number>(225);
  const [tempTotalSeats, setTempTotalSeats] = useState<number>(225);

  const handleSetTotalSeats = () => {
    if (tempTotalSeats <= 0) {
      setFormError("Total seats must be greater than 0");
      return;
    }

    setTotalSeats(tempTotalSeats);
    updateSettings?.({
      districts: districts,
      totalSeats: tempTotalSeats,
    });

    setFormSuccess("Total seats updated successfully");
    setTimeout(() => setFormSuccess(null), 3000);
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const districtId = formData.name.toLowerCase().replace(/\s+/g, "-");
    const existingDistrict = districts.find((d) => d.id === districtId);

    if (existingDistrict) {
      setFormError("A district with this name already exists");
      return;
    }

    // Calculate total seats after adding new district
    const currentTotalSeats = districts
      .filter((d) => d.id !== "all-districts")
      .reduce((sum, d) => sum + d.seats, 0);
    const newTotalSeats = currentTotalSeats + formData.seats;

    if (newTotalSeats > totalSeats) {
      setFormError(
        `Adding this district would exceed the Total Parliament Seats (${totalSeats}). Current total: ${currentTotalSeats}, New total would be: ${newTotalSeats}`
      );
      return;
    }

    const newDistrict = {
      id: districtId,
      name: formData.name,
      province: formData.province,
      seats: formData.seats,
      totalVotes: 0,
      rejectedVotes: 0,
      validVotes: 0,
      bonusSeats: 0,
      bonusSeatPartyId: null,
    };

    // Add the new district while preserving the "all-districts" entry
    const updatedDistricts = [
      ...districts.filter((d) => d.id !== "all-districts"),
      newDistrict,
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
      totalSeats,
    });

    setFormSuccess("District added successfully");
    setFormData({ name: "", province: "", seats: 0 });
    setTimeout(() => setFormSuccess(null), 3000);
  };

  const handleUpdateDistrictSeats = (districtId: string, newSeats: number) => {
    if (newSeats < 0) {
      setFormError("Number of seats cannot be negative");
      return;
    }

    // Calculate total seats after updating
    const currentTotalSeats = districts.reduce((sum, d) => sum + d.seats, 0);
    const districtCurrentSeats =
      districts.find((d) => d.id === districtId)?.seats || 0;
    const newTotalSeats = currentTotalSeats - districtCurrentSeats + newSeats;

    if (newTotalSeats > totalSeats) {
      setFormError(
        `Updating seats would exceed the Total Parliament Seats (${totalSeats}). Current total: ${currentTotalSeats}, New total would be: ${newTotalSeats}`
      );
      return;
    }

    const updatedDistricts = districts.map((d) => {
      if (d.id === districtId) {
        return { ...d, seats: newSeats };
      }
      return d;
    });

    updateSettings?.({
      districts: updatedDistricts,
      totalSeats,
    });

    setFormSuccess("District seats updated successfully");
    setTimeout(() => setFormSuccess(null), 3000);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError("District name is required");
      return false;
    }
    if (!formData.province.trim()) {
      setFormError("Province is required");
      return false;
    }
    if (formData.seats <= 0) {
      setFormError("Number of seats must be greater than 0");
      return false;
    }
    return true;
  };

  const handleDelete = (districtId: string) => {
    const updatedDistricts = districts.filter((d) => d.id !== districtId);

    updateSettings?.({
      districts: updatedDistricts,
      totalSeats,
    });

    setFormSuccess("District deleted successfully");
    setTimeout(() => setFormSuccess(null), 3000);
  };

  const handleClear = () => {
    setFormData({ name: "", province: "", seats: 0 });
    setFormError(null);
  };

  const handleAddDistrict = (district: District) => {
    const districtId = getDistrictId(district);

    const existingDistrict = districts.find((d) => d.id === districtId);

    if (existingDistrict) {
      setFormError("This district is already added");
      return;
    }

    // Calculate total seats after adding new district
    const currentTotalSeats = districts
      .filter((d) => d.id !== "all-districts")
      .reduce((sum, d) => sum + d.seats, 0);
    const newTotalSeats = currentTotalSeats + district.seats;

    if (newTotalSeats > totalSeats) {
      setFormError(
        `Adding this district would exceed the Total Parliament Seats (${totalSeats}). Current total: ${currentTotalSeats}, New total would be: ${newTotalSeats}`
      );
      return;
    }

    const updatedDistricts = [
      ...districts.filter((d) => d.id !== "all-districts"),
      {
        ...district,
        id: districtId,
        totalVotes: 0,
        rejectedVotes: 0,
        validVotes: 0,
        bonusSeats: 0,
        bonusSeatPartyId: null,
      },
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
      totalSeats,
    });

    setFormSuccess("District added successfully");
    setTimeout(() => setFormSuccess(null), 3000);
  };

  // Filter out the 'all-districts' option
  const districtOptions = districts.filter((d) => d.id !== "all-districts");
  const addedDistrictIds = new Set(districtOptions.map((d) => d.id));
  const currentTotalDistrictSeats = districtOptions.reduce(
    (sum, d) => sum + d.seats,
    0
  );

  // Get all districts to display (both default and added)
  const displayDistricts = initialDistricts.filter(
    (district) => district.id !== "all-districts"
  );
  // Add any districts that aren't in the default list
  districtOptions.forEach((addedDistrict) => {
    if (!initialDistricts.some((d) => d.id === addedDistrict.id)) {
      displayDistricts.push(addedDistrict);
    }
  });

  // Ensure all districts have consistent IDs
  const getDistrictId = (district: District) => {
    // Special case for Ampara (Digamadulla)
    if (district.name === "Ampara (Digamadulla)") {
      return "digamadulla";
    }
    return district.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace special chars with hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  };

  return (
    <div className={commonStyles.container}>
      {/* Total Seats Summary */}
      <div className={commonStyles.card}>
        <h2 className={commonStyles.title}>Total Parliament Seats</h2>
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-4 mt-2">
              <input
                type="number"
                min="1"
                value={tempTotalSeats}
                onChange={(e) =>
                  setTempTotalSeats(parseInt(e.target.value) || 0)
                }
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-800 focus:border-teal-800"
              />
              <button
                onClick={handleSetTotalSeats}
                className={commonStyles.button.primary}
              >
                Set Total Seats
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Total Parliament Seats: {totalSeats}
            </p>
            <p
              className={`text-sm mt-1 ${
                currentTotalDistrictSeats === totalSeats
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              Current District Seats Total: {currentTotalDistrictSeats}
              {currentTotalDistrictSeats !== totalSeats &&
                ` (${totalSeats - currentTotalDistrictSeats} seats remaining)`}
            </p>
          </div>
        </div>
      </div>

      {/* District List */}
      <div className={commonStyles.table.container}>
        <h2 className={commonStyles.title}>District List</h2>
        <table className={commonStyles.table.table}>
          <thead className={commonStyles.table.header}>
            <tr>
              <th className={commonStyles.table.headerCell}>District Name</th>
              <th className={commonStyles.table.headerCell}>Province</th>
              <th className={commonStyles.table.headerCell}>Seats</th>
              <th className={commonStyles.table.headerCell}>Actions</th>
            </tr>
          </thead>
          <tbody className={commonStyles.table.body}>
            {displayDistricts.map((district) => {
              const districtId = getDistrictId(district);
              const isAdded = addedDistrictIds.has(districtId);
              const addedDistrict = districts.find((d) => d.id === districtId);

              return (
                <tr key={districtId} className={commonStyles.table.row}>
                  <td className={commonStyles.table.cell}>
                    <div className="text-sm font-medium text-gray-900">
                      {district.name}
                    </div>
                  </td>
                  <td className={commonStyles.table.cell}>
                    <div className="text-sm text-gray-700">
                      {district.province}
                    </div>
                  </td>
                  <td className={commonStyles.table.cell}>
                    <input
                      type="number"
                      min="0"
                      value={addedDistrict?.seats || district.seats}
                      onChange={(e) =>
                        handleUpdateDistrictSeats(
                          districtId,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-800 focus:border-teal-800"
                      disabled={!isAdded}
                    />
                  </td>
                  <td className={commonStyles.table.cell}>
                    <div className="flex space-x-2">
                      {isAdded ? (
                        <button
                          onClick={() => handleDelete(districtId)}
                          className={commonStyles.button.danger}
                          title="Delete"
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddDistrict(district)}
                          className={commonStyles.button.primary}
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add District Form */}
      <div className={commonStyles.formGroup}>
        <h2 className={commonStyles.title}>Add New District</h2>

        {formError && (
          <div className={commonStyles.alert.error}>{formError}</div>
        )}

        {formSuccess && (
          <div className={commonStyles.alert.success}>{formSuccess}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div>
              <label htmlFor="name" className={commonStyles.label}>
                District Name
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
              <label htmlFor="province" className={commonStyles.label}>
                Province
              </label>
              <select
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                className={commonStyles.select}
                required
              >
                <option value="">Select Province</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="seats" className={commonStyles.label}>
                Number of Seats
              </label>
              <input
                type="number"
                id="seats"
                name="seats"
                min="1"
                value={formData.seats}
                onChange={handleChange}
                className={commonStyles.input}
                required
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button type="submit" className={commonStyles.button.primary}>
              Add District
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
    }, 3000);
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
      }, 3000);
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
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const [checked, setChecked] = useState<{ [partyId: string]: boolean }>({});
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Update checked state when district selection changes
  React.useEffect(() => {
    if (selectedDistrictId) {
      const nominated = districtNominations[selectedDistrictId] || [];
      const newChecked: { [partyId: string]: boolean } = {};
      parties.forEach((p) => {
        newChecked[p.id] = nominated.includes(p.id);
      });
      setChecked(newChecked);
    } else {
      setChecked({});
    }
  }, [selectedDistrictId, parties, districtNominations]);

  const handleCheck = (partyId: string) => {
    setChecked((prev) => ({ ...prev, [partyId]: !prev[partyId] }));
  };

  const handleSave = () => {
    if (!selectedDistrictId) return;
    const nominated = Object.entries(checked)
      .filter(([_, v]) => v)
      .map(([partyId]) => partyId);
    setDistrictNominations(selectedDistrictId, nominated);
    setFormSuccess("Nominations updated successfully");
    setTimeout(() => setFormSuccess(null), 2000);
  };

  // Filter out the 'all-districts' option
  const districtOptions = districts.filter((d) => d.id !== "all-districts");

  return (
    <div className={commonStyles.container}>
      <h2 className={commonStyles.title}>Assign Parties to Districts</h2>

      {/* District Selection */}
      <div className={commonStyles.formGroup}>
        <label className={commonStyles.label}>Select District</label>
        <select
          className={commonStyles.select}
          value={selectedDistrictId}
          onChange={(e) => setSelectedDistrictId(e.target.value)}
        >
          <option value="">Select a district</option>
          {districtOptions.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
      </div>

      {selectedDistrictId && (
        <>
          {/* Party Selection */}
          <div className={commonStyles.formGroup}>
            <h3 className={commonStyles.label}>
              Select Parties for{" "}
              {districts.find((d) => d.id === selectedDistrictId)?.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parties.map((party) => (
                <label
                  key={party.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked[party.id] || false}
                    onChange={() => handleCheck(party.id)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <div className="flex items-center space-x-2">
                    {party.logoData && (
                      <img
                        src={party.logoData}
                        alt={`${party.name} logo`}
                        className="w-6 h-6 object-contain"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {party.name}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className={commonStyles.button.primary}
            >
              Save Nominations
            </button>
          </div>

          {/* Success Message */}
          {formSuccess && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
              {formSuccess}
            </div>
          )}
        </>
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
                className={`p-4 border rounded-lg ${
                  isComplete ? "bg-green-50 border-green-200" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    {district.name}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      isComplete
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
                    <div className="text-xs font-medium text-gray-500 mb-2">
                      Nominated Parties:
                    </div>
                    <div className="space-y-2">
                      {nominatedParties.map((party) => (
                        <div
                          key={party.id}
                          className="flex items-center space-x-2 text-sm bg-white p-2 rounded border"
                        >
                          {party.logoData && (
                            <img
                              src={party.logoData}
                              alt={`${party.name} logo`}
                              className="w-5 h-5 object-contain"
                            />
                          )}
                          <span className="text-gray-700">{party.name}</span>
                        </div>
                      ))}
                    </div>
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

export default AdminPanel;
