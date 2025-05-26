import React, { useState } from "react";
import { useElectionData } from "../context/ElectionDataContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Settings: React.FC = () => {
  const { districts, electionStats, updateSettings } = useElectionData();
  const navigate = useNavigate();
  const [totalSeats, setTotalSeats] = useState<number>(
    electionStats.totalSeats || 225
  );
  // Exclude "All Districts (all)" from the district list
  const [districtList, setDistrictList] = useState(
    districts.filter(
      (d) =>
        d.id !== "all" && d.id !== "all-districts" && d.name !== "All Districts"
    )
  );
  const [newDistrict, setNewDistrict] = useState({
    name: "",
    province: "",
    seats: "",
  });

  // Add new district handler (local only, for now)
  const handleAddDistrict = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newDistrict.name.trim() ||
      !newDistrict.province.trim() ||
      !newDistrict.seats
    )
      return;
    setDistrictList([
      ...districtList,
      {
        id: newDistrict.name.toLowerCase().replace(/\s+/g, "-"),
        name: newDistrict.name,
        province: newDistrict.province,
        totalVotes: 0,
        rejectedVotes: 0,
        validVotes: 0,
        seats: Number(newDistrict.seats),
        bonusSeats: 0,
        bonusSeatPartyId: null,
      },
    ]);
    setNewDistrict({ name: "", province: "", seats: "" });
  };

  // Remove district handler (local only, for now)
  const handleRemoveDistrict = (id: string) => {
    setDistrictList(districtList.filter((d) => d.id !== id));
  };

  // Save handler: persist to context
  const handleSave = () => {
    if (updateSettings) {
      updateSettings({ districts: districtList, totalSeats });
    }
    alert(
      `Saved!\nTotal Seats: ${totalSeats}\nDistricts: ${districtList
        .map((d) => d.name)
        .join(", ")}`
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      {/* Back Button */}
      <button
        className="flex items-center gap-2 mb-4 text-teal-800 hover:text-teal-900 font-medium"
        onClick={() => navigate("/admin")}
        title="Back"
      >
        <ArrowLeft size={22} />
        <span>Back</span>
      </button>
      <h1 className="text-2xl font-bold mb-6 text-teal-800">Settings</h1>
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-teal-800">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Election Settings
        </h2>

        {/* Total Seats */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Parliament Seats
          </label>
          <input
            type="number"
            min={1}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={totalSeats}
            onChange={(e) => setTotalSeats(Number(e.target.value))}
          />
        </div>

        {/* Districts List */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Districts
          </label>
          <ul className="mb-2">
            {districtList.map((d) => (
              <li key={d.id} className="flex items-center gap-2 mb-1">
                <span className="flex-1">
                  {d.name}{" "}
                  <span className="text-xs text-gray-500">({d.province})</span>
                </span>
                <span className="text-xs text-gray-500">Seats: {d.seats}</span>
                <button
                  className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  onClick={() => handleRemoveDistrict(d.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <form className="flex gap-2 mt-2" onSubmit={handleAddDistrict}>
            <input
              type="text"
              className="flex-1 px-2 py-1 border border-gray-300 rounded"
              placeholder="District Name"
              value={newDistrict.name}
              onChange={(e) =>
                setNewDistrict((nd) => ({ ...nd, name: e.target.value }))
              }
              required
            />
            <input
              type="text"
              className="flex-1 px-2 py-1 border border-gray-300 rounded"
              placeholder="Province"
              value={newDistrict.province}
              onChange={(e) =>
                setNewDistrict((nd) => ({ ...nd, province: e.target.value }))
              }
              required
            />
            <input
              type="number"
              min={1}
              className="w-20 px-2 py-1 border border-gray-300 rounded"
              placeholder="Seats"
              value={newDistrict.seats}
              onChange={(e) =>
                setNewDistrict((nd) => ({
                  ...nd,
                  seats: e.target.value,
                }))
              }
              required
            />
            <button
              type="submit"
              className="px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700"
            >
              Add
            </button>
          </form>
        </div>

        <button
          className="px-6 py-2 bg-teal-700 text-white rounded hover:bg-teal-800 font-semibold"
          onClick={handleSave}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
