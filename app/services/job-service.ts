import axios from 'axios';
import { API_URL, getAuthHeaders } from './api-config';

// Types
export interface JobPosition {
  id?: number;
  title: string;
  description: string;
  requirements: string;
  department: string;
  created_at?: string;
  is_active: boolean;
}

// Service pour les offres d'emploi
const JobService = {
  // Récupérer toutes les offres d'emploi
  getAllJobs: async (): Promise<JobPosition[]> => {
    try {
      const response = await axios.get(`${API_URL}/jobs`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer une offre d'emploi par son ID
  getJobById: async (id: number): Promise<JobPosition> => {
    try {
      const response = await axios.get(`${API_URL}/jobs/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les offres d'emploi par département
  getJobsByDepartment: async (department: string): Promise<JobPosition[]> => {
    try {
      const response = await axios.get(`${API_URL}/jobs/department/${department}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Créer une nouvelle offre d'emploi (réservé aux RH)
  createJob: async (jobData: JobPosition): Promise<any> => {
    try {
      const response = await axios.post(`${API_URL}/jobs`, jobData, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour une offre d'emploi (réservé aux RH)
  updateJob: async (id: number, jobData: Partial<JobPosition>): Promise<any> => {
    try {
      const response = await axios.put(`${API_URL}/jobs/${id}`, jobData, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Supprimer une offre d'emploi (réservé aux RH)
  deleteJob: async (id: number): Promise<any> => {
    try {
      const response = await axios.delete(`${API_URL}/jobs/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default JobService;
