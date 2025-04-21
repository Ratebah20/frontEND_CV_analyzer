// Configuration de l'API
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Fonction pour obtenir les headers d'authentification
export const getAuthHeaders = () => {
  let token = '';
  
  // Vérifier si window est défini (pas en SSR)
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token') || '';
  }
  
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    withCredentials: true
  };
};

// Fonction pour obtenir les headers pour l'upload de fichiers
export const getUploadHeaders = () => {
  let token = '';
  
  // Vérifier si window est défini (pas en SSR)
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token') || '';
  }
  
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    withCredentials: true
  };
};
