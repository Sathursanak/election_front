import React, { useState } from "react";
import { useElectionData } from "../context/ElectionDataContext";

const AddPartyForm: React.FC = () => {
  const { districts, addParty, selectedDistrictId } = useElectionData();

  const [formData, setFormData] = useState({
    name: "",
    logoData: undefined as string | undefined,
    votes: "", // initially empty
    districtId:
      selectedDistrictId === "all-districts" ? "" : selectedDistrictId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.districtId ||
      formData.votes === "" ||
      !formData.logoData
    ) {
      alert("Please fill in all required fields");
      return;
    }

    addParty({
      name: formData.name,
      logoData: formData.logoData,
      votes: parseInt(formData.votes), // convert from string to number here
      districtId: formData.districtId,
    });

    // Reset form
    setFormData({
      name: "",
      logoData: undefined,
      votes: "",
      districtId:
        selectedDistrictId === "all-districts" ? "" : selectedDistrictId,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Add New Party
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Party Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="logoFile"
            className="block text-sm font-medium text-gray-700"
          >
            Logo File *
          </label>
          <input
            type="file"
            id="logoFile"
            name="logoFile"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            required
          />
          {formData.logoData && (
            <img
              src={formData.logoData}
              alt="Logo preview"
              className="w-10 h-10 object-contain border border-gray-200 rounded mt-2"
            />
          )}
        </div>

        <div>
          <label
            htmlFor="districtId"
            className="block text-sm font-medium text-gray-700"
          >
            District *
          </label>
          <select
            id="districtId"
            name="districtId"
            value={formData.districtId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            required
          >
            <option value="">Select a district</option>
            {districts
              .filter((d) => d.id !== "all-districts")
              .map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="votes"
            className="block text-sm font-medium text-gray-700"
          >
            Votes *
          </label>
          <input
            type="number"
            id="votes"
            name="votes"
            value={formData.votes === "0" ? "" : formData.votes}
            onChange={handleChange}
            min="0"
            placeholder="Enter vote count"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Add Party
        </button>
      </form>
    </div>
  );
};

export default AddPartyForm;
