import React, { useState } from "react";
import { ChevronDown, ChevronRight, Menu, X, Search } from "lucide-react";
import { useElectionData } from "../context/ElectionDataContext";
import { provinces } from "../data/mockData";

interface DistrictNavigationProps {
  className?: string;
}

const DistrictNavigation: React.FC<DistrictNavigationProps> = ({
  className = "",
}) => {
  const { districts, selectedDistrictId, setSelectedDistrictId } =
    useElectionData();
  const [expandedProvinces, setExpandedProvinces] = useState<
    Record<string, boolean>
  >(provinces.reduce((acc, province) => ({ ...acc, [province.id]: true }), {}));
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleProvince = (provinceId: string) => {
    setExpandedProvinces((prev) => ({
      ...prev,
      [provinceId]: !prev[provinceId],
    }));
  };

  const handleDistrictSelect = (districtId: string) => {
    setSelectedDistrictId(districtId);
    setIsMobileNavOpen(false);
  };

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const filteredDistricts = districts.filter(
    (district) =>
      district.id !== "all-districts" &&
      district.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProvinces = () => {
    return provinces.map((province) => {
      const provinceDistricts = filteredDistricts.filter(
        (d) => d.province === province.id
      );
      if (provinceDistricts.length === 0) return null;

      return (
        <div key={province.id} className="mb-2">
          <button
            className="flex items-center w-full text-left px-3 py-2 bg-teal-900 text-white rounded-md hover:bg-teal-800 transition"
            onClick={() => toggleProvince(province.id)}
          >
            {expandedProvinces[province.id] ? (
              <ChevronDown size={16} className="mr-2" />
            ) : (
              <ChevronRight size={16} className="mr-2" />
            )}
            {province.name}
          </button>

          {expandedProvinces[province.id] && (
            <div className="ml-4 mt-1 space-y-1">
              {provinceDistricts.map((district) => (
                <button
                  key={district.id}
                  className={`w-full text-left px-3 py-2 rounded-md transition ${
                    selectedDistrictId === district.id
                      ? "bg-teal-100 text-teal-800 font-semibold"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleDistrictSelect(district.id)}
                >
                  {district.name}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 bg-teal-800 text-white p-2 rounded-md shadow-lg"
        onClick={toggleMobileNav}
        aria-label="Toggle districts menu"
      >
        <Menu size={20} />
      </button>

      {/* Main Navigation */}
      <div
        className={`
          fixed md:sticky top-0 h-screen bg-white border-r border-gray-200 shadow-md overflow-y-auto
          transition-transform duration-300 ease-in-out z-30
          ${className}
          ${
            isMobileNavOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* Mobile Close Button */}
        <div className="flex justify-between items-center p-4 md:hidden">
          <h2 className="font-bold text-lg">Electoral Districts</h2>
          <button onClick={toggleMobileNav} aria-label="Close districts menu">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <h2 className="font-bold text-lg text-teal-800 mb-4 hidden md:block">
            Electoral Districts
          </h2>

          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              placeholder="Search districts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {renderProvinces()}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-teal bg-opacity-50 z-20 md:hidden"
          onClick={toggleMobileNav}
        ></div>
      )}
    </>
  );
};

export default DistrictNavigation;
