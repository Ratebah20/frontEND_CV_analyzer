import axios from 'axios';
import { getAuthHeaders } from './api-config';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Types
export interface JobPosition {
  id: number;
  title: string;
  description: string;
  requirements: string;
  department_id: number;
  department_name?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  application_count?: number;
}

// Service pour les offres d'emploi
class JobService {
  // Récupérer toutes les offres d'emploi
  static async getAllJobs(): Promise<JobPosition[]> {
    try {
      const response = await axios.get(`${API_URL}/jobs`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }

  // Récupérer une offre d'emploi par son ID
  static async getJobById(id: number): Promise<JobPosition> {
    try {
      const response = await axios.get(`${API_URL}/jobs/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error);
      throw error;
    }
  }

  // Récupérer les offres d'emploi par département
  static async getJobsByDepartment(departmentId: number): Promise<JobPosition[]> {
    try {
      const response = await axios.get(`${API_URL}/jobs/department/${departmentId}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error fetching jobs for department ${departmentId}:`, error);
      throw error;
    }
  }

  // Créer une nouvelle offre d'emploi
  static async createJob(jobData: Omit<JobPosition, 'id' | 'created_at' | 'updated_at'>): Promise<JobPosition> {
    try {
      console.log('Création d\'une offre d\'emploi avec les données:', jobData);
      console.log('Headers d\'authentification:', getAuthHeaders());
      const response = await axios.post(`${API_URL}/jobs`, jobData, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error creating job:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  // Mettre à jour une offre d'emploi
  static async updateJob(id: number, jobData: Partial<JobPosition>): Promise<JobPosition> {
    try {
      const response = await axios.put(`${API_URL}/jobs/${id}`, jobData, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error(`Error updating job ${id}:`, error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  // Supprimer une offre d'emploi
  static async deleteJob(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/jobs/${id}`, getAuthHeaders());
    } catch (error: any) {
      console.error(`Error deleting job ${id}:`, error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }
}

export default JobService;
