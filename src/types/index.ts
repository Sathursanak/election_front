export interface District {
  id: string;
  name: string;
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
  id?: string;
  provinceName: string;
  noOfDistricts: number;
}