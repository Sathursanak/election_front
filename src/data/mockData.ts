import { District, Party, Province, ElectionStats } from '../types';

export const provinces: Province[] = [
  {
    id: 'western',
    name: 'Western Province',
    districts: ['colombo', 'gampaha', 'kalutara']
  },
  {
    id: 'central',
    name: 'Central Province',
    districts: ['kandy', 'matale', 'nuwara-eliya']
  },
  {
    id: 'southern',
    name: 'Southern Province',
    districts: ['galle', 'matara', 'hambantota']
  },
  {
    id: 'northern',
    name: 'Northern Province',
    districts: ['jaffna', 'vanni']
  },
  {
    id: 'eastern',
    name: 'Eastern Province',
    districts: ['batticaloa', 'digamadulla', 'trincomalee']
  },
  {
    id: 'north-western',
    name: 'North Western Province',
    districts: ['kurunegala', 'puttalam']
  },
  {
    id: 'north-central',
    name: 'North Central Province',
    districts: ['anuradhapura', 'polonnaruwa']
  },
  {
    id: 'uva',
    name: 'Uva Province',
    districts: ['badulla', 'monaragala']
  },
  {
    id: 'sabaragamuwa',
    name: 'Sabaragamuwa Province',
    districts: ['ratnapura', 'kegalle']
  }
];

export const initialDistricts: District[] = [
  {
    id: 'colombo',
    name: 'Colombo',
    province: 'western',
    totalVotes: 500000,
    rejectedVotes: 10000,
    validVotes: 490000,
    seats: 22,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'gampaha',
    name: 'Gampaha',
    province: 'western',
    totalVotes: 450000,
    rejectedVotes: 9000,
    validVotes: 441000,
    seats: 20,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'kalutara',
    name: 'Kalutara',
    province: 'western',
    totalVotes: 300000,
    rejectedVotes: 6000,
    validVotes: 294000,
    seats: 15,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'kandy',
    name: 'Kandy',
    province: 'central',
    totalVotes: 320000,
    rejectedVotes: 6400,
    validVotes: 313600,
    seats: 12,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'matale',
    name: 'Matale',
    province: 'central',
    totalVotes: 200000,
    rejectedVotes: 4000,
    validVotes: 196000,
    seats: 8,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'nuwara-eliya',
    name: 'Nuwara Eliya',
    province: 'central',
    totalVotes: 220000,
    rejectedVotes: 4400,
    validVotes: 215600,
    seats: 9,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'galle',
    name: 'Galle',
    province: 'southern',
    totalVotes: 280000,
    rejectedVotes: 5600,
    validVotes: 274400,
    seats: 10,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'matara',
    name: 'Matara',
    province: 'southern',
    totalVotes: 260000,
    rejectedVotes: 5200,
    validVotes: 254800,
    seats: 9,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'hambantota',
    name: 'Hambantota',
    province: 'southern',
    totalVotes: 240000,
    rejectedVotes: 4800,
    validVotes: 235200,
    seats: 8,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'jaffna',
    name: 'Jaffna',
    province: 'northern',
    totalVotes: 280000,
    rejectedVotes: 5600,
    validVotes: 274400,
    seats: 10,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'vanni',
    name: 'Vanni',
    province: 'northern',
    totalVotes: 180000,
    rejectedVotes: 3600,
    validVotes: 176400,
    seats: 6,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'batticaloa',
    name: 'Batticaloa',
    province: 'eastern',
    totalVotes: 220000,
    rejectedVotes: 4400,
    validVotes: 215600,
    seats: 8,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'digamadulla',
    name: 'Ampara (Digamadulla)',
    province: 'eastern',
    totalVotes: 240000,
    rejectedVotes: 4800,
    validVotes: 235200,
    seats: 9,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'trincomalee',
    name: 'Trincomalee',
    province: 'eastern',
    totalVotes: 200000,
    rejectedVotes: 4000,
    validVotes: 196000,
    seats: 7,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'kurunegala',
    name: 'Kurunegala',
    province: 'north-western',
    totalVotes: 380000,
    rejectedVotes: 7600,
    validVotes: 372400,
    seats: 11,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'puttalam',
    name: 'Puttalam',
    province: 'north-western',
    totalVotes: 260000,
    rejectedVotes: 5200,
    validVotes: 254800,
    seats: 9,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'anuradhapura',
    name: 'Anuradhapura',
    province: 'north-central',
    totalVotes: 300000,
    rejectedVotes: 6000,
    validVotes: 294000,
    seats: 11,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'polonnaruwa',
    name: 'Polonnaruwa',
    province: 'north-central',
    totalVotes: 220000,
    rejectedVotes: 4400,
    validVotes: 215600,
    seats: 8,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'badulla',
    name: 'Badulla',
    province: 'uva',
    totalVotes: 240000,
    rejectedVotes: 4800,
    validVotes: 235200,
    seats: 9,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'monaragala',
    name: 'Monaragala',
    province: 'uva',
    totalVotes: 200000,
    rejectedVotes: 4000,
    validVotes: 196000,
    seats: 7,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'ratnapura',
    name: 'Ratnapura',
    province: 'sabaragamuwa',
    totalVotes: 260000,
    rejectedVotes: 5200,
    validVotes: 254800,
    seats: 9,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'kegalle',
    name: 'Kegalle',
    province: 'sabaragamuwa',
    totalVotes: 240000,
    rejectedVotes: 4800,
    validVotes: 235200,
    seats: 8,
    bonusSeats: 1,
    bonusSeatPartyId: null
  },
  {
    id: 'all-districts',
    name: 'All Districts',
    province: 'all',
    totalVotes: 0,
    rejectedVotes: 0,
    validVotes: 0,
    seats: 0,
    bonusSeats: 0,
    bonusSeatPartyId: null
  }
];

export const initialParties: Party[] = [];

export const electionStats: ElectionStats = {
  totalVotes: 12345678,
  totalSeats: 196,
  participatingParties: 15
};

// Helper functions
export const getDistrictById = (id: string): District | undefined => {
  return initialDistricts.find(district => district.id === id);
};

export const getPartiesByDistrictId = (districtId: string): Party[] => {
  return initialParties.filter(party => party.districtId === districtId);
};

export const getProvinceByDistrictId = (districtId: string): Province | undefined => {
  const district = getDistrictById(districtId);
  if (!district) return undefined;
  return provinces.find(province => province.id === district.province);
};

export const getDistrictsByProvinceId = (provinceId: string): District[] => {
  return initialDistricts.filter(district => district.province === provinceId);
};