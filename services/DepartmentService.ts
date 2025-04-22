import axios from 'axios';
import { getAuthHeaders } from '../app/services/api-config';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Department {
  id: number;
  name: string;
  description?: string;
}

const DepartmentService = {
  // Récupérer tous les départements
  getDepartments: async (): Promise<Department[]> => {
    try {
      const response = await axios.get(`${API_URL}/departments`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des départements:', error);
      throw error;
    }
  },

  // Récupérer un département spécifique
  getDepartment: async (id: number): Promise<Department> => {
    try {
      const response = await axios.get(`${API_URL}/departments/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du département ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouveau département (réservé aux RH)
  createDepartment: async (departmentData: Omit<Department, 'id'>): Promise<any> => {
    try {
      const response = await axios.post(`${API_URL}/departments`, departmentData, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du département:', error);
      throw error;
    }
  },

  // Mettre à jour un département existant (réservé aux RH)
  updateDepartment: async (id: number, departmentData: Partial<Department>): Promise<any> => {
    try {
      const response = await axios.put(`${API_URL}/departments/${id}`, departmentData, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du département ${id}:`, error);
      throw error;
    }
  },

  // Initialiser les départements standards (réservé aux RH)
  seedDepartments: async (): Promise<any> => {
    try {
      const response = await axios.post(`${API_URL}/departments/seed`, {}, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des départements:', error);
      throw error;
    }
  }
};

export default DepartmentService;
