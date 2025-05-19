import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  initialDistricts, 
  initialParties, 
  electionStats as initialStats 
} from '../data/mockData';
import { District, Party, ElectionStats, DistrictVote } from '../types';

interface ElectionDataContextType {
  districts: District[];
  parties: Party[];
  electionStats: ElectionStats;
  selectedDistrictId: string;
  setSelectedDistrictId: (id: string) => void;
  addParty: (party: Omit<Party, 'id' | 'percentage' | 'seats' | 'hasBonusSeat'>) => void;
  updateParty: (party: Party) => void;
  deleteParty: (id: string) => void;
  updateDistrictVotes: (districtVote: DistrictVote) => void;
  deleteDistrictVotes: (districtId: string) => void;
}

const ElectionDataContext = createContext<ElectionDataContextType | undefined>(undefined);

export const ElectionDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [districts, setDistricts] = useState<District[]>(initialDistricts);
  const [parties, setParties] = useState<Party[]>(initialParties);
  const [electionStats, setElectionStats] = useState<ElectionStats>(initialStats);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('colombo');

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedDistricts = localStorage.getItem('districts');
    const storedParties = localStorage.getItem('parties');
    const storedStats = localStorage.getItem('electionStats');

    if (storedDistricts) setDistricts(JSON.parse(storedDistricts));
    if (storedParties) setParties(JSON.parse(storedParties));
    if (storedStats) setElectionStats(JSON.parse(storedStats));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('districts', JSON.stringify(districts));
    localStorage.setItem('parties', JSON.stringify(parties));
    localStorage.setItem('electionStats', JSON.stringify(electionStats));
  }, [districts, parties, electionStats]);

  // Calculate party percentages, seats, and bonus seats
  const calculatePartyStats = (party: Party, district: District): Party => {
    const percentage = district.validVotes > 0 ? (party.votes / district.validVotes) * 100 : 0;
    const seats = Math.floor(party.votes / 20000); // Mock calculation
    const hasBonusSeat = district.bonusSeatPartyId === party.id;
    
    return {
      ...party,
      percentage,
      seats,
      hasBonusSeat
    };
  };

  // Determine bonus seat party for a district
  const determineBonusSeatParty = (districtId: string): string | null => {
    const districtParties = parties.filter(p => p.districtId === districtId);
    
    if (districtParties.length === 0) return null;
    
    const highestVotesParty = districtParties.reduce((prev, current) => 
      (prev.votes > current.votes) ? prev : current
    );
    
    return highestVotesParty.id;
  };

  // Add a new party
  const addParty = (partyData: Omit<Party, 'id' | 'percentage' | 'seats' | 'hasBonusSeat'>) => {
    const newPartyId = `${partyData.name.toLowerCase().replace(/\s+/g, '-')}-${partyData.districtId}`;
    
    const district = districts.find(d => d.id === partyData.districtId);
    if (!district) return;
    
    const newParty: Party = {
      ...partyData,
      id: newPartyId,
      percentage: 0,
      seats: 0,
      hasBonusSeat: false
    };
    
    // Calculate stats for the new party
    const partyWithStats = calculatePartyStats(newParty, district);
    
    setParties(prev => [...prev, partyWithStats]);
    
    // Update district's bonus seat party if this party has the highest votes
    const bonusSeatPartyId = determineBonusSeatParty(partyData.districtId);
    
    setDistricts(prev => 
      prev.map(d => 
        d.id === partyData.districtId 
          ? { ...d, bonusSeatPartyId } 
          : d
      )
    );
    
    // Update election stats
    updateElectionStats();
  };

  // Update an existing party
  const updateParty = (updatedParty: Party) => {
    const district = districts.find(d => d.id === updatedParty.districtId);
    if (!district) return;

    const partyWithStats = calculatePartyStats(updatedParty, district);
    
    setParties(prev => 
      prev.map(p => 
        p.id === updatedParty.id 
          ? partyWithStats
          : p
      )
    );
    
    // Recalculate bonus seat party
    const bonusSeatPartyId = determineBonusSeatParty(updatedParty.districtId);
    
    setDistricts(prev => 
      prev.map(d => 
        d.id === updatedParty.districtId 
          ? { ...d, bonusSeatPartyId } 
          : d
      )
    );
    
    // Update election stats
    updateElectionStats();
  };

  // Delete a party
  const deleteParty = (id: string) => {
    const partyToDelete = parties.find(p => p.id === id);
    if (!partyToDelete) return;
    
    setParties(prev => prev.filter(p => p.id !== id));
    
    // Recalculate bonus seat party
    const districtId = partyToDelete.districtId;
    const bonusSeatPartyId = determineBonusSeatParty(districtId);
    
    setDistricts(prev => 
      prev.map(d => 
        d.id === districtId 
          ? { ...d, bonusSeatPartyId } 
          : d
      )
    );
    
    // Update election stats
    updateElectionStats();
  };

  // Update district votes
  const updateDistrictVotes = (districtVote: DistrictVote) => {
    const { districtId, totalVotes, rejectedVotes } = districtVote;
    const validVotes = totalVotes - rejectedVotes;
    
    setDistricts(prev => 
      prev.map(d => 
        d.id === districtId 
          ? { 
              ...d, 
              totalVotes, 
              rejectedVotes, 
              validVotes 
            } 
          : d
      )
    );
    
    // Recalculate party percentages and seats for this district
    const districtParties = parties.filter(p => p.districtId === districtId);
    const district = { 
      ...districts.find(d => d.id === districtId)!, 
      validVotes 
    };
    
    const updatedParties = districtParties.map(p => calculatePartyStats(p, district));
    
    setParties(prev => 
      prev.map(p => 
        updatedParties.find(up => up.id === p.id) || p
      )
    );
    
    // Update election stats
    updateElectionStats();
  };

  // Delete district votes
  const deleteDistrictVotes = (districtId: string) => {
    setDistricts(prev => 
      prev.map(d => 
        d.id === districtId 
          ? { 
              ...d, 
              totalVotes: 0, 
              rejectedVotes: 0, 
              validVotes: 0, 
              bonusSeatPartyId: null 
            } 
          : d
      )
    );
    
    // Update party percentages and seats
    const districtParties = parties.filter(p => p.districtId === districtId);
    const updatedParties = districtParties.map(p => ({
      ...p,
      percentage: 0,
      seats: 0,
      hasBonusSeat: false
    }));
    
    setParties(prev => 
      prev.map(p => 
        updatedParties.find(up => up.id === p.id) || p
      )
    );
    
    // Update election stats
    updateElectionStats();
  };

  // Update overall election stats
  const updateElectionStats = () => {
    const totalVotes = districts.reduce((sum, district) => 
      district.id !== 'all-districts' ? sum + district.totalVotes : sum, 0
    );
    
    const totalSeats = districts.reduce((sum, district) => 
      district.id !== 'all-districts' ? sum + district.seats : sum, 0
    );
    
    const uniquePartyNames = new Set(parties.map(party => party.name));
    const participatingParties = uniquePartyNames.size;
    
    setElectionStats({
      totalVotes,
      totalSeats,
      participatingParties
    });
  };

  const value = {
    districts,
    parties,
    electionStats,
    selectedDistrictId,
    setSelectedDistrictId,
    addParty,
    updateParty,
    deleteParty,
    updateDistrictVotes,
    deleteDistrictVotes
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
    throw new Error('useElectionData must be used within an ElectionDataProvider');
  }
  return context;
};