export interface District {
  id: string | number; // Allow number for new backend IDs
  districtName: string;
  name: string;
  idProvince: number | string;
  provinceName: string;
  province: string;
  totalVotes: number;
  rejectedVotes: number;
  validVotes: number;
  seats: number;
  bonusSeats: number;
  bonusSeatPartyId: string | null;
}

export interface Party {
  id: string;
  name: string;
  votes: number;
  color: string; // Color for the party
  districtId: string;
  logoData?: string;
  percentage?: number;
  seats?: number;
  hasBonusSeat?: boolean;
}

export interface Province {
  id: string;
  name: string;
  districts: string[];
}

export interface DistrictVote {
  districtId: string;
  totalVotes: number;
  rejectedVotes: number;
}

export interface ElectionStats {
  totalVotes: number;
  totalSeats: number;
  participatingParties: number;
}

export interface IProvince {
  id: string;
  provinceName: string;
  noOfDistricts: number;
}

// Add new interfaces for backend data structure if necessary
// For example, if backend returns a Party with partyName and partyColor
export interface BackendParty {
  id: number;
  partyName: string;
  idElection: number;
  partyColor: string;
}