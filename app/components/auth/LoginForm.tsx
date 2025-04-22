import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import AuthService, { LoginRequest } from '../../services/auth-service';
import { useUser } from '../../context/userContext';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Alert,
  CircularProgress
} from '@mui/material';

const LoginForm: React.FC = () => {
  const router = useRouter();
  const { refreshUser } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginRequest>();

  const onSubmit: SubmitHandler<LoginRequest> = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      // Connexion
      const response = await AuthService.login(data);
      
      // Mettre à jour le contexte utilisateur
      await refreshUser();
      
      // Récupérer l'utilisateur pour vérifier son rôle
      const user = response.user;
      
      // Redirection en fonction du rôle
      if (user.is_hr) {
        // Rediriger les RH vers l'interface de gestion des candidatures
        router.push('/candidatures');
      } else {
        // Rediriger les managers vers leur tableau de bord
        router.push('/manager-dashboard');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de la connexion'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5'
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          width: '100%', 
          maxWidth: 400,
          borderRadius: 2
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Connexion ATS_CV
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Nom d'utilisateur"
            autoComplete="username"
            autoFocus
            {...register('username', { required: 'Ce champ est requis' })}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="password"
            label="Mot de passe"
            type="password"
            autoComplete="current-password"
            {...register('password', { required: 'Ce champ est requis' })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Se connecter'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm;
