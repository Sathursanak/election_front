// src/utils/dataService.ts
import { District, Party, ElectionStats, IProvince } from '../types';
import { initialParties, electionStats as initialStats } from '../data/mockData';
import axios from 'axios';

const USE_MOCK = false; // Set to false to use backend
const API_BASE = 'http://localhost:8000'; // Change to your backend base URL

export const dataService = {
  async getDistricts(): Promise<District[]> {
    if (USE_MOCK) return [];
    try {
      const res = await axios.get(`${API_BASE}/district`);
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  },
  async addDistrict(district: District | { districtName: string; idProvince: number | string } | { districtName: string; idProvince: number | string }[]): Promise<any> {
    try {
      // Ensure idProvince is a number and format matches backend expectations
      const processDistrict = (d: any) => ({
        districtName: d.districtName,
        idProvince: typeof d.idProvince === 'string' ? parseInt(d.idProvince) : d.idProvince
      });

      const payload = Array.isArray(district)
        ? district.map(processDistrict)
        : processDistrict(district);

      console.log('Sending payload to backend:', payload);
      const res = await axios.post(`${API_BASE}/district`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Backend response:', res.data);

      // The backend returns an array of responses for bulk insert
      if (Array.isArray(res.data)) {
        return { status: 'success', data: res.data };
      }
      // For single insert, check the status
      if (res.data && res.data.status === 'success') {
        return res.data;
      }
      throw new Error(res.data?.message || 'Failed to add district');
    } catch (error: any) {
      console.error('Error adding district:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },
  async updateDistrict(district: District): Promise<District> {
    try {
      const res = await axios.put(`${API_BASE}/district/${district.id}`, district);
      return res.data;
    } catch (error) {
      console.error('Error updating district:', error);
      throw error;
    }
  },
  async deleteDistrict(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE}/district/${id}`);
    } catch (error) {
      console.error('Error deleting district:', error);
      throw error;
    }
  },
  async getParties(): Promise<Party[]> {
    if (USE_MOCK) return initialParties;
    try {
      const res = await axios.get(`${API_BASE}/parties`);
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error('Error fetching parties:', error);
      return [];
    }
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
    try {
      const res = await axios.get(`${API_BASE}/electionStats`);
      return res.data || initialStats;
    } catch (error) {
      console.error('Error fetching election stats:', error);
      return initialStats;
    }
  },

  async addProvince(payload: IProvince): Promise<IProvince> {
    try {
      const res = await axios.post(`${API_BASE}/province`, payload);
      return res.data;
    } catch (error) {
      console.error('Error adding province:', error);
      throw error;
    }
  },

  async getProvince(): Promise<IProvince[]> {
    try {
      const res = await axios.get(`${API_BASE}/province`);
      if (res.data.status === 'success' && Array.isArray(res.data.provinces)) {
        return res.data.provinces.map((province: any) => ({
          id: province.id.toString(),
          provinceName: province.provinceName,
          noOfDistricts: province.noOfDistricts
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return [];
    }
  },
  // Add more methods for votes, nominations, etc. as needed
};
