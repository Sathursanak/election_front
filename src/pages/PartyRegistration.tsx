import React, { useEffect } from "react";
import { useElectionData } from "../context/ElectionDataContext";
import axios from "axios";
import { Party } from "../types";
import { color, motion } from "framer-motion";
import { Edit2, Trash2 } from "lucide-react";
import { dataService } from "../utils/dataService";

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
  flag: {
    container: "relative flex items-center",
    pole: "w-2 h-16 bg-gray-600 rounded-t",
    flag: "relative w-24 h-12 overflow-hidden",
    wave: "absolute inset-0 bg-current opacity-20",
    base: "absolute inset-0",
    shadow: "absolute inset-0 bg-black opacity-5"
  }
};

const FlagDisplay: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div className="relative flex items-center">
      <svg width="4" height="64" viewBox="0 0 4 64" className="mr-1">
        <motion.path
          d="M2 0 L2 64"
          stroke="#4B5563"
          strokeWidth="4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.circle
          cx="2"
          cy="0"
          r="2"
          fill="#4B5563"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      </svg>

      <motion.svg
        width="96"
        height="48"
        viewBox="0 0 96 48"
        className="relative"
        initial={{ rotate: -5 }}
        animate={{ rotate: 5 }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: 2,
          ease: "easeInOut"
        }}
      >
        <defs>
          <linearGradient id={`wave-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <motion.stop
              offset="0%"
              stopColor={color}
              initial={{ stopOpacity: 0.8 }}
              animate={{ stopOpacity: 0.6 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 2
              }}
            />
            <motion.stop
              offset="100%"
              stopColor={color}
              initial={{ stopOpacity: 0.6 }}
              animate={{ stopOpacity: 0.8 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 2
              }}
            />
          </linearGradient>
        </defs>

        <motion.path
          d="M0 0 L96 0 L96 48 L0 48 Z"
          fill={color}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />

        <motion.path
          d="M0 0 Q24 12 48 0 T96 0 L96 48 L0 48 Z"
          fill={`url(#wave-${color})`}
          initial={{ y: 0 }}
          animate={{ y: [0, 4, 0] }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
        />

        <motion.path
          d="M0 0 L8 4 L8 44 L0 48 Z"
          fill={color}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 0.5 }}
        />
      </motion.svg>
    </div>
  );
};

const globalStyles = `
  @keyframes wave {
    0% {
      transform: translateX(0) translateY(0) skew(0deg);
    }
    25% {
      transform: translateX(-5px) translateY(2px) skew(2deg);
    }
    50% {
      transform: translateX(-10px) translateY(5px) skew(0deg);
    }
    75% {
      transform: translateX(-5px) translateY(2px) skew(-2deg);
    }
    100% {
      transform: translateX(0) translateY(0) skew(0deg);
    }
  }
`;

const ManageParties: React.FC = () => {
  const { addParty, updateParty, deleteParty, year } = useElectionData();
  const [formData, setFormData] = React.useState<{
    id: string | null;
    name: string;
    color: string;
    districtId: string;
  }>({
    id: null,
    name: "",
    color: "#000000",
    districtId: "all-districts",
  });
  const [formError, setFormError] = React.useState<string | null>(null);
  const [formSuccess, setFormSuccess] = React.useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [partyToDelete, setPartyToDelete] = React.useState<any>(null);
  const [parties, setParties] = React.useState<Party[]>([]);

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
    if (!formData.color) {
      setFormError("Party color is required");
      return false;
    }
    // Check for duplicate colors
    const colorExists = parties.some(
      (p: any) => p.color.toLowerCase() === formData.color.toLowerCase() && p.id !== formData.id
    );
    if (colorExists) {
      setFormError("This color is already used by another party");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const nameExists = parties.some(
      (p: any) =>
        p.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
        p.id !== formData.id
    );
    if (nameExists) {
      setFormError("A party with this name already exists.");
      return;
    }

    try {
      if (formData.id) {
        // Update existing party
        const existingParty = parties.find((p: any) => p.id === formData.id);
        if (existingParty) {
          updateParty({
            ...existingParty,
            name: formData.name,
            color: formData.color,
          });
          setFormSuccess("Party updated successfully");
        }
      } else {
        // Add new party
        const idElection = year;

        console.log('Sending party data:', {
          partyName: formData.name,
          color: formData.color,
          idElection: idElection
        });

        const response = await axios.post('http://localhost:8000/party/add', {
          partyName: formData.name,
          partyColor: formData.color,
          idElection: idElection
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log('API Response:', response.data);

        if (response.data.status === 'success') {
          getParties()
          const newParty = {
            id: response.data.partyId.toString(),
            name: formData.name,
            votes: 0,
            color: formData.color,
            districtId: formData.districtId,
          } as Party;
          addParty(newParty);
          setFormSuccess("Party added successfully");
        } else {
          setFormError(response.data.message || "Failed to add party");
          return;
        }
      }

      // Reset form
      setFormData({
        id: null,
        name: "",
        color: "#000000",
        districtId: "all-districts",
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setFormSuccess(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error adding party:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        setFormError(error.response.data.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        setFormError("No response from server. Please check if the server is running.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        setFormError("Failed to add party. Please try again.");
      }
    }
  };


  const getParties = async () => {
    const idElection = year;
    const par = await dataService.getParties(idElection)
    const convertData = par.map((p) => {
      return {
        id: p.id,
        name: p.partyName,
        color: p.partyColor
      }
    })
    setParties(convertData)
  }

  useEffect(() => {
    getParties()
  }, [])

  const handleEdit = (party: any) => {
    setFormData({
      id: party.id,
      name: party.name,
      color: party.color,
      districtId: party.districtId,
    });
    setFormError(null);
  };

  const handleDelete = (party: any) => {
    setPartyToDelete(party);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (partyToDelete) {
      deleteParty(partyToDelete.id);
      setFormSuccess("Party deleted successfully");
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
      color: "#000000",
      districtId: "all-districts",
    });
    setFormError(null);
  };

  return (
    <div className={commonStyles.container}>
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
              <label htmlFor="color" className={commonStyles.label}>
                Party Color
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="h-10 w-20 cursor-pointer"
                />
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
      <div className={commonStyles.table.container}>
        <h2 className={commonStyles.title}>Party List</h2>
        <table className={commonStyles.table.table}>
          <thead className={commonStyles.table.header}>
            <tr>
              <th className={commonStyles.table.headerCell}>Party Name</th>
              <th className={commonStyles.table.headerCell}>Color</th>
              <th className={commonStyles.table.headerCell}>Actions</th>
            </tr>
          </thead>
          <tbody className={commonStyles.table.body}>
            {parties.map((party: any) => (
              <tr key={party.id} className={commonStyles.table.row}>
                <td className={commonStyles.table.cell}>
                  <div className="text-sm font-medium text-gray-900">
                    {party.name}
                  </div>
                </td>
                <td className={commonStyles.table.cell}>
                  <FlagDisplay color={party.color} />
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

// --- AssignPartiesToDistricts Component (copied from AdminPanel) ---
const AssignPartiesToDistricts: React.FC<{
  onComplete: () => void;
}> = ({ onComplete }) => {
  const { districts, parties, districtNominations, setDistrictNominations } =
    useElectionData();
  const [formSuccess, setFormSuccess] = React.useState<string | null>(null);
  const districtOptions = districts.filter(
    (d: any) => d.id !== "all-districts"
  );

  // Check if all districts have at least one party assigned
  const isAllDistrictsAssigned = districtOptions.every(
    (district: any) => (districtNominations[district.id] || []).length > 0
  );

  const handleComplete = () => {
    onComplete();
    setFormSuccess("Party assignments completed successfully!");
    setTimeout(() => setFormSuccess(null), 3000);
  };

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
      `Nominations updated for ${districts.find((d: any) => d.id === districtId)?.name
      }`
    );
    setTimeout(() => setFormSuccess(null), 1500);
  };

  return (
    <div className={commonStyles.container}>
      <h2 className={commonStyles.title}>Assign Parties to Districts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {districtOptions.map((district: any) => {
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
                  parties.map((party: any) => (
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
                      <FlagDisplay color={party.partyColor} />
                      <span className="text-sm">{party.partyName}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      {formSuccess && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md text-center">
          {formSuccess}
        </div>
      )}
      <div className="mt-8">
        <h3 className={commonStyles.label}>Assignment Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {districtOptions.map((district: any) => {
            const nominated = districtNominations[district.id] || [];
            const isComplete = nominated.length > 0;
            const nominatedParties = parties.filter((p: any) =>
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
                      {nominatedParties.map((p: any) => (
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
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleComplete}
          disabled={!isAllDistrictsAssigned}
          className={`${commonStyles.button.primary} ${!isAllDistrictsAssigned ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          Complete Assignment
        </button>
      </div>
    </div>
  );
};

const PartyRegistration: React.FC = () => {
  const [step, setStep] = React.useState(1);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);

  const handleStepChange = (newStep: number) => {
    if (newStep > step) {
      // When moving forward, mark current step as completed
      setCompletedSteps(prev => [...prev, step]);
    }
    setStep(newStep);
  };

  const steps = [
    {
      id: 1,
      title: "Add Parties",
      component: <ManageParties />,
    },
    {
      id: 2,
      title: "Assign Parties to Districts",
      component: <AssignPartiesToDistricts onComplete={() => {
        setCompletedSteps(prev => [...prev, 2]);
      }} />,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <h1 className="text-2xl md:text-3xl font-bold text-center text-teal-800 mb-8">
        Party Registration
      </h1>

      {/* Stepper */}
      <div className="mb-10 flex items-center justify-center gap-0 w-full max-w-2xl mx-auto">
        {steps.map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${step === s.id
                    ? "border-teal-600 bg-teal-50"
                    : completedSteps.includes(s.id)
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 bg-gray-50"
                  }
                `}
              >
                {completedSteps.includes(s.id) ? (
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
                    className={`w-6 h-6 ${step === s.id ? "text-teal-600" : "text-gray-400"
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
              <span className="mt-2 text-xs text-center font-medium">
                {s.title}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 ${completedSteps.includes(s.id) ? "bg-green-500" : "bg-gray-300"
                  }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-teal-800">
          {steps[step - 1].component}
        </div>
        <div className="flex justify-between mt-8">
          {/* Only show Edit Party Details button on Assign step */}
          {step === 2 ? (
            <button
              className={commonStyles.button.secondary}
              onClick={() => handleStepChange(1)}
            >
              Edit Party Details
            </button>
          ) : (
            <span />
          )}
          {/* Only show Next button on Add Parties step */}
          {step === 1 ? (
            <button
              className={commonStyles.button.primary}
              onClick={() => handleStepChange(2)}
            >
              Assign Parties to Districts
            </button>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
};

export default PartyRegistration;
