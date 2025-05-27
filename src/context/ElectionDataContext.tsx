// Delete a district (backend-ready)
const deleteDistrict = async (districtId: string) => {
  // Delete from backend or mock
  await dataService.deleteDistrict(districtId);
  setDistricts((prev) => prev.filter((d) => d.id !== districtId));
  // Optionally, remove parties in this district as well
  setParties((prev) => prev.filter((p) => p.districtId !== districtId));
  updateElectionStats();
};
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { dataService } from "../utils/dataService";
import { District, Party, ElectionStats, DistrictVote } from "../types";
import { sampleElectionData } from '../data/sampleElectionData';

interface ElectionDataContextType {
  electionData: any[];
  electionStats: {
    totalVotes: number;
    totalSeats: number;
  };
  year: number;
  setYear: (year: number) => void;
  districts: District[];
  parties: Party[];
  selectedDistrictId: string;
  setSelectedDistrictId: (id: string) => void;
  addParty: (
    party: Omit<Party, "id" | "percentage" | "seats" | "hasBonusSeat">
  ) => void;
  updateParty: (party: Party) => void;
  deleteParty: (id: string) => void;
  updateDistrictVotes: (districtVote: DistrictVote) => void;
  deleteDistrictVotes: (districtId: string) => void;
  deleteDistrict: (districtId: string) => void;
  districtNominations: { [districtId: string]: string[] };
  setDistrictNominations: (districtId: string, partyIds: string[]) => void;
  updateSettings: (settings: {
    districts: District[];
    totalSeats: number;
  }) => void;
  updatePartyVotes: (
    partyId: string,
    districtId: string,
    votes: number
  ) => void;
}

const ElectionDataContext = createContext<ElectionDataContextType | undefined>(
  undefined
);

export const ElectionDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [electionData] = useState(sampleElectionData);
  const [year, setYear] = useState(2025);
  const [districts, setDistricts] = useState<District[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [electionStats, setElectionStats] = useState<ElectionStats>({
    totalVotes: 0,
    totalSeats: 0,
    participatingParties: 0,
  });
  const [selectedDistrictId, setSelectedDistrictId] =
    useState<string>("all-districts");
  const [districtNominations, setDistrictNominationsState] = useState<{
    [districtId: string]: string[];
  }>({});

  // (Removed localStorage for year, use state only)

  // Update settings and ensure total seats consistency (backend-ready)
  const updateSettings = async (settings: {
    districts: District[];
    totalSeats: number;
  }) => {
    // Save all districts to backend or mock
    const savedDistricts = await Promise.all(
      settings.districts.map(async (district) => {
        // If district exists, update; else, add
        const exists = districts.find((d) => d.id === district.id);
        if (exists) {
          return await dataService.updateDistrict(district);
        } else {
          return await dataService.addDistrict(district);
        }
      })
    );
    setDistricts(savedDistricts);
    setElectionStats((prev) => ({ ...prev, totalSeats: settings.totalSeats }));
  };

  // Load data from backend or mock on initial render
  useEffect(() => {
    dataService.getDistricts().then(setDistricts);
    dataService.getParties().then(setParties);
    dataService.getElectionStats().then(setElectionStats);
  }, []);

  // (Removed localStorage for district nominations, use state only)

  // Calculate party percentages, seats, and bonus seats
  const calculatePartyStats = (party: Party, district: District): Party => {
    const percentage =
      district.validVotes > 0 ? (party.votes / district.validVotes) * 100 : 0;
    const seats = Math.floor(party.votes / 20000); // Mock calculation
    const hasBonusSeat = district.bonusSeatPartyId === party.id;

    return {
      ...party,
      percentage,
      seats,
      hasBonusSeat,
    };
  };

  // Determine bonus seat party for a district
  const determineBonusSeatParty = (districtId: string): string | null => {
    const districtParties = parties.filter((p) => p.districtId === districtId);

    if (districtParties.length === 0) return null;

    const highestVotesParty = districtParties.reduce((prev, current) =>
      prev.votes > current.votes ? prev : current
    );

    return highestVotesParty.id;
  };

  // Add a new party (backend-ready)
  const addParty = async (
    partyData: Omit<Party, "id" | "percentage" | "seats" | "hasBonusSeat">
  ) => {
    const newPartyId = `${partyData.name.toLowerCase().replace(/\s+/g, "-")}-${
      partyData.districtId
    }`;
    const district = districts.find((d) => d.id === partyData.districtId);
    if (!district) return;

    const newParty: Party = {
      ...partyData,
      id: newPartyId,
      percentage: 0,
      seats: 0,
      hasBonusSeat: false,
    };

    // Save to backend or mock
    const savedParty = await dataService.addParty(newParty);

    // Calculate stats for the new party
    const partyWithStats = calculatePartyStats(savedParty, district);

    setParties((prev) => [...prev, partyWithStats]);

    // Update district's bonus seat party if this party has the highest votes
    const bonusSeatPartyId = determineBonusSeatParty(partyData.districtId);
    setDistricts((prev) =>
      prev.map((d) =>
        d.id === partyData.districtId ? { ...d, bonusSeatPartyId } : d
      )
    );
    updateElectionStats();
  };

  // Update an existing party (backend-ready)
  const updateParty = async (updatedParty: Party) => {
    const district = districts.find((d) => d.id === updatedParty.districtId);
    if (!district) return;

    // Save to backend or mock
    const savedParty = await dataService.updateParty(updatedParty);

    const partyWithStats = calculatePartyStats(savedParty, district);

    setParties((prev) =>
      prev.map((p) => (p.id === updatedParty.id ? partyWithStats : p))
    );

    // Recalculate bonus seat party
    const bonusSeatPartyId = determineBonusSeatParty(updatedParty.districtId);
    setDistricts((prev) =>
      prev.map((d) =>
        d.id === updatedParty.districtId ? { ...d, bonusSeatPartyId } : d
      )
    );
    updateElectionStats();
  };

  // Delete a party (backend-ready)
  const deleteParty = async (id: string) => {
    const partyToDelete = parties.find((p) => p.id === id);
    if (!partyToDelete) return;

    // Delete from backend or mock
    await dataService.deleteParty(id);

    setParties((prev) => prev.filter((p) => p.id !== id));

    // Recalculate bonus seat party
    const districtId = partyToDelete.districtId;
    const bonusSeatPartyId = determineBonusSeatParty(districtId);
    setDistricts((prev) =>
      prev.map((d) => (d.id === districtId ? { ...d, bonusSeatPartyId } : d))
    );
    updateElectionStats();
  };

  // Update district votes
  const updateDistrictVotes = (districtVote: DistrictVote) => {
    const { districtId, totalVotes, rejectedVotes } = districtVote;
    const validVotes = totalVotes - rejectedVotes;

    setDistricts((prev) =>
      prev.map((d) =>
        d.id === districtId
          ? {
              ...d,
              totalVotes,
              rejectedVotes,
              validVotes,
            }
          : d
      )
    );

    // Recalculate party percentages and seats for this district
    const districtParties = parties.filter((p) => p.districtId === districtId);
    const district = {
      ...districts.find((d) => d.id === districtId)!,
      validVotes,
    };

    const updatedParties = districtParties.map((p) =>
      calculatePartyStats(p, district)
    );

    setParties((prev) =>
      prev.map((p) => updatedParties.find((up) => up.id === p.id) || p)
    );

    // Update election stats
    updateElectionStats();
  };

  // Delete district votes
  const deleteDistrictVotes = (districtId: string) => {
    setDistricts((prev) =>
      prev.map((d) =>
        d.id === districtId
          ? {
              ...d,
              totalVotes: 0,
              rejectedVotes: 0,
              validVotes: 0,
              bonusSeatPartyId: null,
            }
          : d
      )
    );

    // Update party percentages and seats
    const districtParties = parties.filter((p) => p.districtId === districtId);
    const updatedParties = districtParties.map((p) => ({
      ...p,
      percentage: 0,
      seats: 0,
      hasBonusSeat: false,
    }));

    setParties((prev) =>
      prev.map((p) => updatedParties.find((up) => up.id === p.id) || p)
    );

    // Update election stats
    updateElectionStats();
  };

  // Update overall election stats
  const updateElectionStats = () => {
    const totalVotes = districts.reduce(
      (sum, district) =>
        district.id !== "all-districts" ? sum + district.totalVotes : sum,
      0
    );

    const uniquePartyNames = new Set(parties.map((party) => party.name));
    const participatingParties = uniquePartyNames.size;

    setElectionStats((prev) => ({
      ...prev,
      totalVotes,
      participatingParties,
      totalSeats: 225, // Always maintain the default value
    }));
  };

  const setDistrictNominations = (districtId: string, partyIds: string[]) => {
    setDistrictNominationsState((prev) => ({
      ...prev,
      [districtId]: partyIds,
    }));
  };

  // Update party votes
  const updatePartyVotes = (
    partyId: string,
    districtId: string,
    votes: number
  ) => {
    const party = parties.find((p) => p.id === partyId);
    if (!party) return;

    const updatedParty = {
      ...party,
      votes,
    };

    updateParty(updatedParty);
  };

  const value = {
    electionData,
    electionStats,
    year,
    setYear,
    districts,
    parties,
    selectedDistrictId,
    setSelectedDistrictId,
    addParty,
    updateParty,
    deleteParty,
    updateDistrictVotes,
    deleteDistrictVotes,
    deleteDistrict,
    updateSettings,
    districtNominations,
    setDistrictNominations,
    updatePartyVotes,
  };

  return (
    <ElectionDataContext.Provider value={value}>
      {children}
    </ElectionDataContext.Provider>
  );
};

export const useElectionData = () => {
  const context = useContext(ElectionDataContext);
  if (context === undefined) {
    throw new Error(
      "useElectionData must be used within an ElectionDataProvider"
    );
  }
  return context;
};
