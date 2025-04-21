import axios from 'axios';
import { API_URL, getAuthHeaders, getUploadHeaders } from './api-config';

// Types
export interface Candidate {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface Application {
  id?: number;
  job_id: number;
  candidate?: Candidate;
  status: number;
  status_text?: string;
  cover_letter?: string;
  cv_filename?: string;
  ai_analysis?: string;
  ai_score?: number;
  created_at?: string;
}

export interface ApplicationFormData {
  job_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  cover_letter?: string;
  cv?: File;
}

// Service pour les candidatures
const ApplicationService = {
  // Récupérer toutes les candidatures (authentification requise)
  getAllApplications: async (): Promise<Application[]> => {
    try {
      const response = await axios.get(`${API_URL}/applications`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer une candidature par son ID (authentification requise)
  getApplicationById: async (id: number): Promise<Application> => {
    try {
      const response = await axios.get(`${API_URL}/applications/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Créer une nouvelle candidature (accessible sans authentification)
  createApplication: async (applicationData: ApplicationFormData): Promise<any> => {
    try {
      // Utiliser FormData pour l'upload de fichier
      const formData = new FormData();
      formData.append('job_id', applicationData.job_id.toString());
      formData.append('first_name', applicationData.first_name);
      formData.append('last_name', applicationData.last_name);
      formData.append('email', applicationData.email);
      formData.append('phone', applicationData.phone || '');
      
      if (applicationData.cover_letter) {
        formData.append('cover_letter', applicationData.cover_letter);
      }
      
      if (applicationData.cv) {
        formData.append('cv', applicationData.cv);
      }
      
      const response = await axios.post(`${API_URL}/applications`, formData, getUploadHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour le statut d'une candidature (authentification requise)
  updateApplicationStatus: async (id: number, status: number): Promise<any> => {
    try {
      const response = await axios.put(
        `${API_URL}/applications/${id}/status`, 
        { status }, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // Analyser le CV d'une candidature avec l'IA (authentification requise)
  analyzeCV: async (id: number): Promise<any> => {
    try {
      const response = await axios.post(
        `${API_URL}/applications/${id}/analyze`, 
        {}, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default ApplicationService;
