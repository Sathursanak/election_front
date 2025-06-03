// src/utils/dataService.ts
import { District, Party, ElectionStats, IProvince } from '../types';
import { initialParties, electionStats as initialStats } from '../data/mockData';
import axios from 'axios';

const USE_MOCK = true; // Set to false to use backend
const API_BASE = 'http://localhost:8000'; // Change to your backend base URL

export const dataService = {
  async getDistricts(): Promise<District[]> {
    if (USE_MOCK) return [];
    const res = await axios.get(`${API_BASE}/districts`);
    return res.data;
  },
  async addDistrict(district: District): Promise<District> {
    if (USE_MOCK) return district;
    const res = await axios.post(`${API_BASE}/districts`, district);
    return res.data;
  },
  async updateDistrict(district: District): Promise<District> {
    if (USE_MOCK) return district;
    const res = await axios.put(`${API_BASE}/districts/${district.id}`, district);
    return res.data;
  },
  async deleteDistrict(id: string): Promise<void> {
    if (USE_MOCK) return;
    await axios.delete(`${API_BASE}/districts/${id}`);
  },
  async getParties(): Promise<Party[]> {
    if (USE_MOCK) return initialParties;
    const res = await axios.get(`${API_BASE}/parties`);
    return res.data;
  },
  async addParty(party: Party): Promise<Party> {
    if (USE_MOCK) return party;
    const res = await axios.post(`${API_BASE}/parties`, party);
    return res.data;
  },
  async updateParty(party: Party): Promise<Party> {
    if (USE_MOCK) return party;
    const res = await axios.put(`${API_BASE}/parties/${party.id}`, party);
    return res.data;
  },
  async deleteParty(id: string): Promise<void> {
    if (USE_MOCK) return;
    await axios.delete(`${API_BASE}/parties/${id}`);
  },
  async getElectionStats(): Promise<ElectionStats> {
    if (USE_MOCK) return initialStats;
    const res = await axios.get(`${API_BASE}/electionStats`);
    return res.data;
  },

  async addProvince(payload: IProvince): Promise<IProvince> {

    const res = await axios.post(`${API_BASE}/province`, payload);
    return res.data;
  },

  async grtProvince(): Promise<IProvince> {
    const res = await axios.get(`${API_BASE}/province`);
    return res.data;
  },
  // Add more methods for votes, nominations, etc. as needed
};
