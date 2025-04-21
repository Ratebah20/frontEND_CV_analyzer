'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '../../services/auth-service';
import { useUser } from '../../context/userContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireHR?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireHR = false 
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const { user, loading: userLoading, error: userError } = useUser();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!AuthService.isAuthenticated()) {
          router.push('/login');
          return;
        }

        if (requireHR && !AuthService.isHR()) {
          router.push('/dashboard');
          return;
        }

        // Si l'utilisateur est déjà chargé via le contexte
        if (!userLoading) {
          if (!user) {
            AuthService.logout();
            router.push('/login');
            return;
          }
          setAuthorized(true);
        }
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, requireHR, user, userLoading]);

  if (loading || userLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return authorized ? <>{children}</> : null;
};

export default ProtectedRoute;
