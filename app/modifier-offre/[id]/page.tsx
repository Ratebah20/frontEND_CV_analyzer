"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ModifierOffre from "@/components/ats/modifier-offre"
import Sidebar from "@/components/sidebar"
import AuthService from "@/app/services/auth-service"

interface ModifierOffrePageProps {
  params: {
    id: string;
  };
}

export default function ModifierOffrePage({ params }: ModifierOffrePageProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const { id } = params

  // Vérifier l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthChecking(true)
        // Vérifier si l'utilisateur est connecté
        const token = localStorage.getItem('access_token')
        
        if (!token) {
          // Rediriger vers la page de connexion si nécessaire
          router.push('/login')
          return
        }
        
        // Vérifier que le token est valide
        try {
          const user = await AuthService.getCurrentUser()
          
          // Vérifier si l'utilisateur existe et a les droits RH
          if (!user || !user.is_hr) {
            console.error('Accès non autorisé: Droits RH requis')
            router.push('/dashboard')
            return
          }
          
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Erreur d\'authentification:', error)
          // Essayer de rafraîchir le token
          try {
            await AuthService.refreshToken()
            const user = await AuthService.getCurrentUser()
            
            // Vérifier si l'utilisateur existe et a les droits RH
            if (!user || !user.is_hr) {
              console.error('Accès non autorisé: Droits RH requis')
              router.push('/dashboard')
              return
            }
            
            setIsAuthenticated(true)
          } catch (refreshError) {
            console.error('Échec du rafraîchissement du token:', refreshError)
            router.push('/login')
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error)
      } finally {
        setAuthChecking(false)
      }
    }
    
    checkAuth()
  }, [router])

  return (
    <div className="flex h-screen bg-zinc-900">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-zinc-950 text-white">
        <div className="p-8 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Modifier une offre d'emploi</h1>
          
          {authChecking ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
              <p>Vérification de l'authentification...</p>
            </div>
          ) : isAuthenticated ? (
            <ModifierOffre jobId={id} />
          ) : (
            <div className="text-center py-12">
              <p>Vous devez être connecté en tant que RH pour accéder à cette section.</p>
              <button 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => router.push('/login')}
              >
                Se connecter
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
