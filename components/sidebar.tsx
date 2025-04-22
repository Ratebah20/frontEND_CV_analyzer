"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { 
  BookOpen, 
  Briefcase,
  Users,
  Settings,
  Search,
  Ticket,
  PlusCircle,
  Calendar,
  LogOut,
  BarChart
} from "lucide-react"
import { Input } from "@/components/ui/input"
import AuthService, { User } from "@/app/services/auth-service"

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Récupérer l'utilisateur courant
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await AuthService.getCurrentUser()
        setCurrentUser(user)
        console.log("Utilisateur dans la sidebar:", user)
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCurrentUser()
  }, [])
  
  return (
    <aside className="w-64 bg-black text-white h-full flex flex-col">
      {/* Logo et titre */}
      <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-6">
        <Ticket className="h-6 w-6" />
        <span className="font-bold">FormationPro</span>
      </div>
      
      {/* Barre de recherche */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Rechercher une formation" 
            className="bg-zinc-900 border-zinc-800 pl-8 text-sm h-9 focus-visible:ring-zinc-700"
          />
        </div>
      </div>
      
      {/* Menu principal */}
      <nav className="space-y-1 px-2">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="h-5 w-5 border-t-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : currentUser ? (
          <>
            {/* Section commune - Accueil */}
            <button 
              onClick={() => router.push(currentUser.is_hr ? '/' : '/manager-dashboard')} 
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${pathname === '/' || pathname === '/manager-dashboard' ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Tableau de bord</span>
            </button>
            
            {/* Section RH uniquement */}
            {currentUser.is_hr && (
              <>
                <button 
                  onClick={() => router.push('/gestion-offres')} 
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${pathname === '/gestion-offres' ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Gestion des offres</span>
                </button>
                
                <button 
                  onClick={() => router.push('/ajouter-offre')} 
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${pathname === '/ajouter-offre' ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Ajouter une offre</span>
                </button>
                
                <button 
                  onClick={() => router.push('/candidatures')} 
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${pathname === '/candidatures' ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
                >
                  <Users className="h-4 w-4" />
                  <span>Candidatures</span>
                </button>
              </>
            )}
            
            {/* Section manager uniquement */}
            {!currentUser.is_hr && (
              <>
                <button 
                  onClick={() => router.push('/manager-dashboard')} 
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${pathname === '/manager-dashboard' ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
                >
                  <BarChart className="h-4 w-4" />
                  <span>Mes candidatures</span>
                </button>
              </>
            )}
            
            {/* Section commune - Entretiens */}
            <button 
              onClick={() => router.push('/gestion-entretiens')} 
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${pathname === '/gestion-entretiens' ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
            >
              <Calendar className="h-4 w-4" />
              <span>Entretiens</span>
            </button>
            
            <div className="border-t border-zinc-800 my-2 pt-2"></div>
            
            <button 
              onClick={() => router.push('/settings')} 
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${pathname === '/settings' ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
            >
              <Settings className="h-4 w-4" />
              <span>Paramètres</span>
            </button>
            
            <button 
              onClick={() => {
                AuthService.logout();
                router.push('/login');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-zinc-800/50 text-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </button>
          </>
        ) : (
          <button 
            onClick={() => router.push('/login')} 
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-zinc-800/50"
          >
            <span>Se connecter</span>
          </button>
        )}
      </nav>
    </aside>
  )
}
