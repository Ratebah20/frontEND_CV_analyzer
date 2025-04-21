'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '../components/auth/LoginForm';
import AuthService from '../services/auth-service';

const LoginPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, rediriger vers le tableau de bord
    if (AuthService.isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  return <LoginForm />;
};

export default LoginPage;
