import React, { useState } from 'react';
import { useElectionData } from '../context/ElectionDataContext';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import lkData from '../data/lk.json';

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

const partyColors: { [key: string]: string } = {
  'SLPP': '#FFD700',
  'SJB': '#4169E1',
  'JVP': '#FF4500',
  'UNP': '#32CD32',
  'TNA': '#FF69B4',
  'SLMC': '#00CED1',
  'ACMC': '#8A2BE2',
  'EPDP': '#FF8C00',
  'default': '#ccc'
};

const partyNames: { [key: string]: string } = {
  'SLPP': 'Sri Lanka Podujana Peramuna',
  'SJB': 'Samagi Jana Balawegaya',
  'JVP': 'Janatha Vimukthi Peramuna',
  'UNP': 'United National Party',
  'TNA': 'Tamil National Alliance',
  'SLMC': 'Sri Lanka Muslim Congress',
  'ACMC': 'All Ceylon Makkal Congress',
  'EPDP': "Eelam People's Democratic Party",
};

const SriLankaMap: React.FC = () => {
  const { electionData } = useElectionData();
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [center, setCenter] = useState<[number, number]>(INITIAL_CENTER);

  // Helper to get English name from GeoJSON name
  const getEnglishDistrictName = (geoName: string) => {
    const entry = Object.entries(districtNameMap).find(([, v]) => v === geoName);
    return entry ? entry[0] : null;
  };

  const getPartyColor = (districtGeoName: string) => {
    if (!electionData) return '#ccc';
    const englishName = getEnglishDistrictName(districtGeoName);
    if (!englishName) return '#ccc';
    const districtData = electionData.find((d: DistrictData) => d.district === englishName);
    if (!districtData) return '#ccc';
    const votes = districtData.votes;
    const entries = Object.entries(votes) as [string, number][];
    const winningParty = entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    return partyColors[winningParty] || partyColors.default;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({
      x: e.clientX + 10,
      y: e.clientY + 10
    });
  };

  const getDistrictResults = (districtGeoName: string) => {
    if (!electionData) return null;
    const englishName = getEnglishDistrictName(districtGeoName);
    if (!englishName) return null;
    const districtData = electionData.find((d: DistrictData) => d.district === englishName);
    if (!districtData) return null;
    return (
      <div className="p-2">
        <h3 className="font-bold mb-2">{englishName}</h3>
        <p className="mb-1">Total Seats: {districtData.seats}</p>
        <div className="space-y-1">
          {(Object.entries(districtData.votes) as [string, number][])
            .sort(([, a], [, b]) => b - a)
            .map(([party, votes]) => (
              <div key={party} className="flex justify-between">
                <span>{party}:</span>
                <span>{votes.toLocaleString()} votes</span>
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
        {Object.entries(partyColors).filter(([key]) => key !== 'default').map(([party, color]) => (
          <div key={party} className="flex items-center mb-2">
            <span className="inline-block w-6 h-6 rounded mr-3 border border-gray-400" style={{ backgroundColor: color }}></span>
            <span className="text-gray-800 text-sm font-medium">{partyNames[party] || party}</span>
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
                      fill={getPartyColor(districtGeoName)}
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
