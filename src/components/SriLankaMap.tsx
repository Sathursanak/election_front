import React, { useState, useMemo } from 'react';
import { useElectionData } from '../context/ElectionDataContext';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import lkData from '../data/lk.json';
import { getPartyColor } from '../utils/partyColors';
import { Party } from '../types';

interface DistrictData {
  district: string;
  seats: number;
  votes: {
    [party: string]: number;
  };
}

// Mapping from English names to GeoJSON names
const districtNameMap: { [key: string]: string } = {
  "Colombo": "Kŏḷamba",
  "Gampaha": "Gampaha",
  "Kalutara": "Kaḷutara",
  "Kandy": "Mahanuvara",
  "Matale": "Mātale",
  "Nuwara Eliya": "Nuvara Ĕliya",
  "Galle": "Gālla",
  "Matara": "Mātara",
  "Hambantota": "Hambantŏṭa",
  "Jaffna": "Yāpanaya",
  "Vanni": "Vavuniyāva",
  "Batticaloa": "Maḍakalapuva",
  "Digamadulla": "Ampāra",
  "Trincomalee": "Trikuṇāmalaya",
  "Kurunegala": "Kuruṇægala",
  "Puttalam": "Puttalama",
  "Anuradhapura": "Anurādhapura",
  "Polonnaruwa": "Pŏḷŏnnaruva",
  "Badulla": "Badulla",
  "Monaragala": "Monaragala",
  "Ratnapura": "Ratnapura",
  "Kegalle": "Kægalla"
};

const INITIAL_CENTER: [number, number] = [80.7, 7.7];
const INITIAL_ZOOM = 1.2;
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

// This is a placeholder SVG map of Sri Lanka with districts. Replace with a detailed SVG or GeoJSON for production.
// You can color districts based on props if needed.

const SriLankaMap: React.FC = () => {
  const { calculatedResults, districts } = useElectionData();
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [center, setCenter] = useState<[number, number]>(INITIAL_CENTER);

  // Get unique parties and their colors from calculated results
  const partyColors = useMemo(() => {
    const colors: { [key: string]: string } = {};
    Object.values(calculatedResults).forEach(districtParties => {
      districtParties.forEach(party => {
        if (!colors[party.name]) {
          colors[party.name] = getPartyColor({ id: party.id, name: party.name });
        }
      });
    });
    return colors;
  }, [calculatedResults]);

  // Helper to get English name from GeoJSON name
  const getEnglishDistrictName = (geoName: string) => {
    const entry = Object.entries(districtNameMap).find(([, v]) => v === geoName);
    return entry ? entry[0] : null;
  };

  const getDistrictColor = (districtGeoName: string) => {
    const englishName = getEnglishDistrictName(districtGeoName);
    if (!englishName) return '#ccc';

    const district = districts.find(d => d.name === englishName);
    if (!district) return '#ccc';

    const districtParties = calculatedResults[district.id];
    if (!districtParties || districtParties.length === 0) return '#ccc';

    // Find party with highest votes
    const winningParty = districtParties.reduce((prev, curr) => 
      (curr.votes > prev.votes) ? curr : prev
    );
    
    return getPartyColor({ id: winningParty.id, name: winningParty.name });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({
      x: e.clientX + 10,
      y: e.clientY + 10
    });
  };

  const getDistrictResults = (districtGeoName: string) => {
    const englishName = getEnglishDistrictName(districtGeoName);
    if (!englishName) return null;

    const district = districts.find(d => d.name === englishName);
    if (!district) return null;

    const districtParties = calculatedResults[district.id];
    if (!districtParties || districtParties.length === 0) return null;

    return (
      <div className="p-2">
        <h3 className="font-bold mb-2">{englishName}</h3>
        <p className="mb-1">Total Seats: {district.seats}</p>
        <div className="space-y-1">
          {districtParties
            .sort((a, b) => b.votes - a.votes)
            .map(party => (
              <div key={party.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span 
                    className="inline-block w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: getPartyColor({ id: party.id, name: party.name }) }}
                  />
                  <span>{party.name}:</span>
                </div>
                <span>{party.votes.toLocaleString()} votes</span>
              </div>
            ))}
        </div>
      </div>
    );
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(z * 1.5, MAX_ZOOM));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.5, MIN_ZOOM));
  const handleReset = () => {
    setZoom(INITIAL_ZOOM);
    setCenter(INITIAL_CENTER);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto border-4 border-gray-300 rounded-xl bg-white flex min-h-[700px]" onMouseMove={handleMouseMove}>
      {/* Party Color Legend */}
      <div className="flex flex-col justify-center items-start p-6 min-w-[220px]">
        <h4 className="font-semibold mb-4 text-gray-700">Party Colors</h4>
        {Object.entries(partyColors).map(([party, color]) => (
          <div key={party} className="flex items-center mb-2">
            <span 
              className="inline-block w-6 h-6 rounded mr-3 border border-gray-400" 
              style={{ backgroundColor: color }}
            />
            <span className="text-gray-800 text-sm font-medium">{party}</span>
          </div>
        ))}
      </div>
      {/* Map and Controls */}
      <div className="flex-1 relative">
        {/* Zoom Controls */}
        <div className="flex justify-end gap-2 p-4 absolute right-0 top-0 z-20">
          <button onClick={handleZoomIn} className="bg-teal-700 text-white px-3 py-1 rounded hover:bg-teal-900">+</button>
          <button onClick={handleZoomOut} className="bg-teal-700 text-white px-3 py-1 rounded hover:bg-teal-900">-</button>
          <button onClick={handleReset} className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-600">Reset</button>
        </div>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            center: [80.5, 7.5],
            scale: 7000
          }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            onMoveEnd={({ zoom, coordinates }) => {
              setZoom(zoom);
              setCenter(coordinates as [number, number]);
            }}
          >
            <Geographies geography={lkData}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const districtGeoName = geo.properties.name;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getDistrictColor(districtGeoName)}
                      stroke="#fff"
                      strokeWidth={0.5}
                      style={{
                        default: {
                          outline: 'none',
                        },
                        hover: {
                          fill: '#F53',
                          outline: 'none',
                          opacity: 0.8,
                        },
                        pressed: {
                          outline: 'none',
                        },
                      }}
                      onMouseEnter={() => setHoveredDistrict(districtGeoName)}
                      onMouseLeave={() => setHoveredDistrict(null)}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {hoveredDistrict && (
          <div
            className="absolute bg-white shadow-lg rounded-lg p-2 z-10 min-w-[200px]"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
            }}
          >
            {getDistrictResults(hoveredDistrict)}
          </div>
        )}
      </div>
    </div>
  );
};

export default SriLankaMap;
