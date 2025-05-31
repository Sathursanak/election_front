import React from "react";
import { useElectionData } from "../context/ElectionDataContext";

// Import the two components from AdminPanel (copying their code here for now)

// --- ManageParties Component (copied from AdminPanel) ---
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

import { Edit2, Trash2 } from "lucide-react";

const ManageParties: React.FC = () => {
  const { parties, addParty, updateParty, deleteParty } = useElectionData();
  const [formData, setFormData] = React.useState<{
    id: string | null;
    name: string;
    logoData?: string;
    districtId: string;
  }>({
    id: null,
    name: "",
    logoData: undefined,
    districtId: "all-districts",
  });
  const [formError, setFormError] = React.useState<string | null>(null);
  const [formSuccess, setFormSuccess] = React.useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [partyToDelete, setPartyToDelete] = React.useState<any>(null);

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
    const nameExists = parties.some(
      (p: any) =>
        p.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
        p.id !== formData.id
    );
    if (nameExists) {
      setFormError("A party with this name already exists.");
      return;
    }
    if (formData.id) {
      const existingParty = parties.find((p: any) => p.id === formData.id);
      if (existingParty) {
        updateParty({
          ...existingParty,
          name: formData.name,
          logoData: formData.logoData,
        });
        setFormSuccess("Party updated successfully");
      }
    } else {
      addParty({
        name: formData.name,
        votes: 0,
        logoData: formData.logoData,
        districtId: formData.districtId,
      });
      setFormSuccess("Party added successfully");
    }
    setFormData({
      id: null,
      name: "",
      logoData: undefined,
      districtId: "all-districts",
    });
    setTimeout(() => {
      setFormSuccess(null);
    }, 3000);
  };

  const handleEdit = (party: any) => {
    setFormData({
      id: party.id,
      name: party.name,
      logoData: party.logoData,
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
      logoData: undefined,
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
            {parties.map((party: any) => (
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
const AssignPartiesToDistricts: React.FC = () => {
  const { districts, parties, districtNominations, setDistrictNominations } =
    useElectionData();
  const [formSuccess, setFormSuccess] = React.useState<string | null>(null);
  const districtOptions = districts.filter(
    (d: any) => d.id !== "all-districts"
  );
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
      `Nominations updated for ${
        districts.find((d: any) => d.id === districtId)?.name
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
                  className={`text-xs px-2 py-1 rounded ${
                    nominated.length > 0
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
    </div>
  );
};

const PartyRegistration: React.FC = () => {
  const [step, setStep] = React.useState(1);

  const steps = [
    {
      id: 1,
      title: "Add Parties",
      component: <ManageParties />,
    },
    {
      id: 2,
      title: "Assign Parties to Districts",
      component: <AssignPartiesToDistricts />,
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
                  ${
                    step === s.id
                      ? "border-teal-600 bg-teal-50"
                      : step > s.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 bg-gray-50"
                  }
                `}
              >
                {step > s.id ? (
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
                      step === s.id ? "text-teal-600" : "text-gray-400"
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
                className={`flex-1 h-0.5 ${
                  step > s.id ? "bg-green-500" : "bg-gray-300"
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
              onClick={() => setStep(1)}
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
              onClick={() => setStep(2)}
            >
              Next
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
