import axios from 'axios';
import { getAuthHeaders } from './api-config';
import { API_URL } from './api-config';

// Interface pour les candidats
export interface Candidate {
  id: number;
  candidate: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  job: {
    id: number;
    title: string;
    description: string;
    department: string;
  };
  status: string;
  status_text: string;
  cover_letter: string;
  cv_filename: string;
  ai_analysis: string;
  ai_score: number;
  created_at: string;
}

// Service pour les candidats
const CandidateService = {
  // Récupérer tous les candidats
  getAllCandidates: async (): Promise<Candidate[]> => {
    try {
      const response = await axios.get(`${API_URL}/applications`, getAuthHeaders());
      console.log('Réponse API candidates:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des candidats:', error);
      return [];
    }
  },
  
  // Récupérer un candidat par son ID
  getCandidateById: async (id: number): Promise<Candidate | null> => {
    try {
      const response = await axios.get(`${API_URL}/applications/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du candidat ${id}:`, error);
      return null;
    }
  },
  
  // Mettre à jour le statut d'un candidat
  updateCandidateStatus: async (id: number, status: string): Promise<boolean> => {
    try {
      await axios.put(`${API_URL}/applications/${id}/status`, { status }, getAuthHeaders());
      return true;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut du candidat ${id}:`, error);
      return false;
    }
  },

  // Récupérer les candidats (sans applications)
  getCandidatesOnly: async (): Promise<any[]> => {
    try {
      const response = await axios.get(`${API_URL}/candidates`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des candidats:', error);
      return [];
    }
  },

  // Récupérer un candidat et ses candidatures
  getCandidateDetails: async (candidateId: number): Promise<any | null> => {
    try {
      const response = await axios.get(`${API_URL}/candidates/${candidateId}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des détails du candidat ${candidateId}:`, error);
      return null;
    }
  }
};

export default CandidateService;
