import axios from 'axios';
import { API_URL, getAuthHeaders } from './api-config';

// Types
export interface InterviewRequest {
  id?: number;
  application_id: number;
  manager_id?: number;
  manager_name?: string;
  candidate?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  job?: {
    id: number;
    title: string;
    department?: string;
  };
  requested_date: string;
  status: string;
  comments?: string;
  created_at?: string;
}

// Service pour les demandes d'entretien
const InterviewRequestService = {
  // Récupérer toutes les demandes d'entretien (authentification requise)
  getAllInterviewRequests: async (): Promise<InterviewRequest[]> => {
    try {
      const response = await axios.get(`${API_URL}/interview-requests`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer une demande d'entretien par son ID (authentification requise)
  getInterviewRequestById: async (id: number): Promise<InterviewRequest> => {
    try {
      const response = await axios.get(`${API_URL}/interview-requests/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Créer une nouvelle demande d'entretien (authentification requise)
  createInterviewRequest: async (requestData: {
    application_id: number;
    requested_date: string;
    comments?: string;
  }): Promise<any> => {
    try {
      const response = await axios.post(
        `${API_URL}/interview-requests`, 
        requestData, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour le statut d'une demande d'entretien (réservé aux RH)
  updateInterviewRequestStatus: async (id: number, status: string): Promise<any> => {
    try {
      const response = await axios.put(
        `${API_URL}/interview-requests/${id}/status`, 
        { status }, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default InterviewRequestService;
