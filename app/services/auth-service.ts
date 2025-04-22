import axios from 'axios';
import { API_URL, getAuthHeaders } from './api-config';

// Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
  department_id: number;
  department_name: string;
  is_hr: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Service d'authentification
const AuthService = {
  // Connexion utilisateur
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      console.log('Tentative de connexion avec:', credentials.username);
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      
      console.log('Réponse de connexion:', response.data);
      
      // Stocker les tokens dans le localStorage
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      console.log('Tokens stockés dans localStorage');
      console.log('Access token:', response.data.access_token);
      
      return response.data;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  },

  // Déconnexion utilisateur
  logout: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  // Rafraîchir le token d'accès
  refreshToken: async (): Promise<string> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      console.log('Refresh token présent:', !!refreshToken);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      console.log('Tentative de rafraîchissement du token...');
      const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        },
        withCredentials: true
      });
      
      console.log('Réponse de rafraîchissement:', response.data);
      
      if (response.data && response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        console.log('Nouveau token stocké dans localStorage');
        return response.data.access_token;
      } else {
        throw new Error('Invalid response format from refresh endpoint');
      }
    } catch (error: any) {
      console.error('Erreur lors du rafraîchissement du token:', error.response?.data || error.message);
      // En cas d'erreur, déconnecter l'utilisateur
      AuthService.logout();
      throw error;
    }
  },

  // Obtenir les informations de l'utilisateur connecté
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Token utilisé pour getCurrentUser:', token ? 'présent' : 'absent');
      
      const headers = getAuthHeaders();
      console.log('Headers pour getCurrentUser:', headers);
      
      const response = await axios.get(`${API_URL}/auth/me`, headers);
      console.log('Réponse de getCurrentUser:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erreur dans getCurrentUser:', error.response?.status, error.response?.data);
      
      // Si le token est expiré ou invalide, essayer de le rafraîchir
      if (error.response?.status === 401) {
        try {
          console.log('Tentative de rafraîchissement du token...');
          await AuthService.refreshToken();
          console.log('Token rafraîchi avec succès');
          
          // Réessayer la requête avec le nouveau token
          const newResponse = await axios.get(`${API_URL}/auth/me`, getAuthHeaders());
          return newResponse.data;
        } catch (refreshError) {
          console.error('Échec du rafraîchissement du token:', refreshError);
          // Si le rafraîchissement échoue, déconnecter l'utilisateur
          AuthService.logout();
          return null;
        }
      }
      
      return null;
    }
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },

  // Vérifier si l'utilisateur est RH
  isHR: (): boolean => {
    const user = localStorage.getItem('user');
    if (!user) return false;
    
    try {
      const userData = JSON.parse(user);
      return userData.is_hr === true;
    } catch (error) {
      return false;
    }
  }
};

export default AuthService;
