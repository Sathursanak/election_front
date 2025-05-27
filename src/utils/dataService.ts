// src/utils/dataService.ts
import { District, Party, ElectionStats } from '../types';
import { initialDistricts, initialParties, electionStats as initialStats } from '../data/mockData';

const USE_MOCK = true; // Set to false to use backend
const API_BASE = 'http://localhost:5000/api'; // Change to your backend base URL

export const dataService = {
  async getDistricts(): Promise<District[]> {
    if (USE_MOCK) return initialDistricts;
    const res = await fetch(`${API_BASE}/districts`);
    return res.json();
  },
  async addDistrict(district: District): Promise<District> {
    if (USE_MOCK) return district;
    const res = await fetch(`${API_BASE}/districts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(district),
    });
    return res.json();
  },
  async updateDistrict(district: District): Promise<District> {
    if (USE_MOCK) return district;
    const res = await fetch(`${API_BASE}/districts/${district.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(district),
    });
    return res.json();
  },
  async deleteDistrict(id: string): Promise<void> {
    if (USE_MOCK) return;
    await fetch(`${API_BASE}/districts/${id}`, { method: 'DELETE' });
  },
  async getParties(): Promise<Party[]> {
    if (USE_MOCK) return initialParties;
    const res = await fetch(`${API_BASE}/parties`);
    return res.json();
  },
  async addParty(party: Party): Promise<Party> {
    if (USE_MOCK) return party;
    const res = await fetch(`${API_BASE}/parties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(party),
    });
    return res.json();
  },
  async updateParty(party: Party): Promise<Party> {
    if (USE_MOCK) return party;
    const res = await fetch(`${API_BASE}/parties/${party.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(party),
    });
    return res.json();
  },
  async deleteParty(id: string): Promise<void> {
    if (USE_MOCK) return;
    await fetch(`${API_BASE}/parties/${id}`, { method: 'DELETE' });
  },
  async getElectionStats(): Promise<ElectionStats> {
    if (USE_MOCK) return initialStats;
    const res = await fetch(`${API_BASE}/electionStats`);
    return res.json();
  },
  // Add more methods for votes, nominations, etc. as needed
};
