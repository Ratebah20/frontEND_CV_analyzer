import axios from 'axios';
import { getAuthHeaders } from './api-config';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Types
export interface Interview {
  id: number;
  application_id: number;
  candidate_id: number;
  candidate_name?: string;
  job_id: number;
  job_title?: string;
  department_id: number;
  interview_date: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Service pour les entretiens
class InterviewService {
  // Récupérer tous les entretiens
  static async getAllInterviews(): Promise<Interview[]> {
    try {
      const response = await axios.get(`${API_URL}/interview-requests`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching interviews:', error);
      throw error;
    }
  }

  // Récupérer un entretien par son ID
  static async getInterviewById(id: number): Promise<Interview> {
    try {
      const response = await axios.get(`${API_URL}/interview-requests/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error fetching interview ${id}:`, error);
      throw error;
    }
  }

  // Récupérer les entretiens par département
  static async getInterviewsByDepartment(departmentId: number): Promise<Interview[]> {
    try {
      // Utiliser l'endpoint générique car le backend filtre déjà par département selon l'utilisateur connecté
      const response = await axios.get(`${API_URL}/interview-requests`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error fetching interviews for department ${departmentId}:`, error);
      throw error;
    }
  }

  // Créer un nouvel entretien
  static async createInterview(interviewData: any): Promise<Interview> {
    try {
      console.log('Création d\'un entretien avec les données brutes:', interviewData);
      
      // Adapter les données au format attendu par l'API
      const requestData = {
        application_id: Number(interviewData.application_id), // S'assurer que c'est un nombre
        requested_date: interviewData.interview_date || interviewData.requested_date, // Accepter les deux formats
        comments: interviewData.notes || interviewData.comments || ''
      };
      
      // Vérifications supplémentaires
      if (!requestData.application_id || isNaN(requestData.application_id)) {
        console.error('application_id invalide:', requestData.application_id);
        throw new Error('application_id doit être un nombre valide');
      }
      
      if (!requestData.requested_date) {
        console.error('requested_date manquante');
        throw new Error('requested_date est requise');
      }
      
      console.log('Données formatées pour l\'API:', requestData);
      console.log('Headers d\'authentification:', getAuthHeaders());
      
      const response = await axios.post(`${API_URL}/interview-requests`, requestData, getAuthHeaders());
      console.log('Réponse de création d\'entretien:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating interview:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  // Mettre à jour un entretien
  static async updateInterview(id: number, interviewData: Partial<Interview>): Promise<Interview> {
    try {
      // Pour la mise à jour du statut, utiliser l'endpoint spécifique
      if (interviewData.status) {
        const response = await axios.put(`${API_URL}/interview-requests/${id}/status`, { status: interviewData.status }, getAuthHeaders());
        return response.data;
      }
      
      // Pour les autres mises à jour (non implémenté côté backend pour l'instant)
      return { id, ...interviewData } as Interview;
    } catch (error) {
      console.error(`Error updating interview ${id}:`, error);
      throw error;
    }
  }

  // Supprimer un entretien
  static async deleteInterview(id: number): Promise<void> {
    try {
      // Note: cette fonctionnalité n'est pas implémentée côté backend
      console.warn(`La suppression d'entretien n'est pas implémentée côté backend`);
      // await axios.delete(`${API_URL}/interview-requests/${id}`, getAuthHeaders());
    } catch (error) {
      console.error(`Error deleting interview ${id}:`, error);
      throw error;
    }
  }
}

export default InterviewService;
