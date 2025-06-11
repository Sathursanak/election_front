import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Menu, X, Search } from "lucide-react";
import { useElectionData } from "../context/ElectionDataContext";
import { dataService } from "../utils/dataService";

interface DistrictNavigationProps {
  className?: string;
  showIslandWideOption?: boolean;
}

const DistrictNavigation: React.FC<DistrictNavigationProps> = ({
  className = "",
  showIslandWideOption = true,
}) => {
  const { districts = [], selectedDistrictId, setSelectedDistrictId, provinces = [], setProvinces } = useElectionData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initially all provinces are collapsed (false)
  const [expandedProvinces, setExpandedProvinces] = useState<Record<string, boolean>>({});
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch provinces and districts when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [provincesData, districtsData] = await Promise.all([
          dataService.getProvince(),
          dataService.getDistricts()
        ]);

        if (provincesData.length > 0) {
          const provinceNames = provincesData.map(p => p.provinceName);
          setProvinces(provinceNames);
          // Initialize expanded state for each province
          setExpandedProvinces(
            provinceNames.reduce((acc, province) => ({ ...acc, [province]: false }), {})
          );
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch provinces and districts");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setProvinces]);

  // Automatically expand provinces that have matching districts in search
  useEffect(() => {
    if (searchQuery.trim() === "") return;
    const expanded: Record<string, boolean> = { ...expandedProvinces };
    provinces.forEach((province) => {
      const hasMatch = districts.some(
        (d) =>
          d.province === province &&
          String(d.id) !== "all-districts" &&
          d.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      expanded[province] = hasMatch;
    });
    setExpandedProvinces(expanded);
  }, [searchQuery, districts, provinces, expandedProvinces]);

  const toggleProvince = (province: string) => {
    setExpandedProvinces((prev) => ({
      ...prev,
      [province]: !prev[province],
    }));
  };

  const handleDistrictSelect = (districtId: string | number) => {
    setSelectedDistrictId(String(districtId));
    setIsMobileNavOpen(false);
  };

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const filteredDistricts = districts.filter(
    (district) =>
      String(district.id) !== "all-districts" &&
      district.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProvinces = () => {
    if (loading) {
      return (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading provinces...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-600 p-4 bg-red-50 rounded-md">
          {error}
        </div>
      );
    }

    if (provinces.length === 0) {
      return (
        <div className="text-center py-4 text-gray-600">
          No provinces available
        </div>
      );
    }

    return provinces.map((province) => {
      const provinceDistricts = filteredDistricts.filter(
        (d) => d.province === province
      );
      if (provinceDistricts.length === 0) return null;

      return (
        <div key={province} className="mb-2">
          <button
            className="flex items-center w-full text-left px-3 py-2 bg-teal-900 text-white rounded-md hover:bg-teal-800 transition"
            onClick={() => toggleProvince(province)}
          >
            {expandedProvinces[province] ? (
              <ChevronDown size={16} className="mr-2" />
            ) : (
              <ChevronRight size={16} className="mr-2" />
            )}
            {province}
          </button>

          {expandedProvinces[province] && (
            <div className="ml-4 mt-1 space-y-1">
              {provinceDistricts.map((district) => (
                <button
                  key={district.id}
                  className={`w-full text-left px-3 py-2 rounded-md transition ${String(selectedDistrictId) === String(district.id)
                    ? "bg-teal-100 font-semibold"
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
          ${isMobileNavOpen
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
          {/* Island-wide Results Button */}
          {showIslandWideOption && (
            <button
              className={`w-full mb-4 px-3 py-2 rounded-md font-bold text-left transition border-2 border-teal-800
                ${selectedDistrictId === "all-districts"
                  ? "bg-teal-800 text-white shadow"
                  : "bg-white text-teal-800 hover:bg-teal-50"
                }
              `}
              onClick={() => {
                handleDistrictSelect("all-districts");
              }}
              aria-label="View island-wide results"
            >
              🏝️ Island-wide Results
            </button>
          )}

          <h2 className="font-bold text-lg text-teal-800 mb-4 hidden md:block">
            Electoral Districts
          </h2>

          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-600" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-teal-300 rounded-md leading-5 bg-white placeholder-gray-700 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-800 focus:border-teal-800 sm:text-sm"
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
