"use client"

import { Suspense, useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  BookOpen, 
  Calendar, 
  DollarSign, 
  Bell, 
  BarChart2, 
  Users, 
  MessagesSquare, 
  FileText, 
  CreditCard, 
  Fuel, 
  ShoppingCart,
  Briefcase,
  GraduationCap,
  Settings,
  User,
  LogOut,
  Ticket,
  Search
} from "lucide-react"

// Importation des composants de formation
import FormationEncoding from "@/components/formation/formation-encoding"
import FormationPlanning from "@/components/formation/formation-planning"
import FormationBudget from "@/components/formation/formation-budget"
import FormationNotifications from "@/components/formation/formation-notifications"
import FormationDashboard from "@/components/formation/formation-dashboard"
import FormationOnboarding from "@/components/formation/formation-onboarding"
import { Chatbox } from "@/components/formation/chatbox"
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import AuthService from './services/auth-service'

// Importer FormationATS de manière dynamique pour éviter les problèmes de SSR avec localStorage
const FormationATS = dynamic(
  () => import('@/components/formation/formation-ats'),
  { ssr: false }
)
import FormationPaie from "@/components/formation/formation-paie"
import CarburantDashboard from "@/components/carburant/carburant-dashboard"
import CarburantTransactions from "@/components/carburant/carburant-transactions"

// Données simulées pour les transactions
const transactionsSimulees = [
  {
    id: "t1",
    date: "2024-03-19",
    stationService: "Total - A6",
    litres: 45,
    prix: 89.55,
    statut: "normal" as const
  },
  {
    id: "t2",
    date: "2024-03-15",
    stationService: "BP - Lyon",
    litres: 50,
    prix: 98.50,
    statut: "normal" as const
  },
  {
    id: "t3",
    date: "2024-03-18",
    stationService: "Shell - Paris",
    litres: 60,
    prix: 118.20,
    statut: "suspect" as const
  }
]

export default function Page() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("encoding")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  // Vérifier l'authentification pour les onglets qui nécessitent l'API
  useEffect(() => {
    const checkAuth = async () => {
      if (activeTab === 'ats') {
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
            await AuthService.getCurrentUser()
            setIsAuthenticated(true)
          } catch (error) {
            console.error('Erreur d\'authentification:', error)
            // Essayer de rafraîchir le token
            try {
              await AuthService.refreshToken()
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
      } else {
        // Pour les autres onglets, pas besoin de vérifier l'authentification
        setAuthChecking(false)
      }
    }
    
    checkAuth()
  }, [activeTab, router])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar - Style ZenTicket */}
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
          <button 
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${activeTab === "encoding" ? "bg-zinc-800" : "hover:bg-zinc-800/50"}`}
            onClick={() => handleTabChange("encoding")}
          >
            <BookOpen className="h-4 w-4" />
            <span>Encodage</span>
          </button>
          
          <button 
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${activeTab === "planning" ? "bg-zinc-800" : "hover:bg-zinc-800/50"}`}
            onClick={() => handleTabChange("planning")}
          >
            <Calendar className="h-4 w-4" />
            <span>Planning Annuel</span>
          </button>
          
          <button 
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${activeTab === "budget" ? "bg-zinc-800" : "hover:bg-zinc-800/50"}`}
            onClick={() => handleTabChange("budget")}
          >
            <DollarSign className="h-4 w-4" />
            <span>Budget</span>
          </button>
          
          <button 
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${activeTab === "notifications" ? "bg-zinc-800" : "hover:bg-zinc-800/50"}`}
            onClick={() => handleTabChange("notifications")}
          >
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </button>
          
          <button 
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${activeTab === "dashboard" ? "bg-zinc-800" : "hover:bg-zinc-800/50"}`}
            onClick={() => handleTabChange("dashboard")}
          >
            <BarChart2 className="h-4 w-4" />
            <span>Tableaux de Bord</span>
          </button>
          
          <button 
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${activeTab === "onboarding" ? "bg-zinc-800" : "hover:bg-zinc-800/50"}`}
            onClick={() => handleTabChange("onboarding")}
          >
            <Users className="h-4 w-4" />
            <span>Onboarding</span>
          </button>
          
          <button 
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${activeTab === "chat" ? "bg-zinc-800" : "hover:bg-zinc-800/50"}`}
            onClick={() => handleTabChange("chat")}
          >
            <MessagesSquare className="h-4 w-4" />
            <span>Assistant IA</span>
          </button>
          
          <div className="border-t border-zinc-800 my-2 pt-2"></div>
          
          <button 
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${activeTab === "ats" ? "bg-zinc-800" : "hover:bg-zinc-800/50"}`}
            onClick={() => handleTabChange("ats")}
          >
            <Briefcase className="h-4 w-4" />
            <span>ATS RH</span>
          </button>
          
          <button 
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${activeTab === "paie" ? "bg-zinc-800" : "hover:bg-zinc-800/50"}`}
            onClick={() => handleTabChange("paie")}
          >
            <CreditCard className="h-4 w-4" />
            <span>Paie</span>
          </button>
          
          <button 
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${activeTab === "carburant" ? "bg-zinc-800" : "hover:bg-zinc-800/50"}`}
            onClick={() => handleTabChange("carburant")}
          >
            <Fuel className="h-4 w-4" />
            <span>Carburant</span>
          </button>
          
          <button 
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${activeTab === "transactions" ? "bg-zinc-800" : "hover:bg-zinc-800/50"}`}
            onClick={() => handleTabChange("transactions")}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Transactions</span>
          </button>
          
          <div className="border-t border-zinc-800 my-2 pt-2"></div>
          
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-zinc-800/50">
            <Settings className="h-4 w-4" />
            <span>Paramètres</span>
          </button>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-zinc-950 text-white">
        <div className="p-8 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Outil de Gestion des Formations</h1>
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsContent value="encoding">
              <Suspense fallback={<div className="text-zinc-400">Chargement...</div>}>
                <FormationEncoding />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="planning">
              <Suspense fallback={<div className="text-zinc-400">Chargement...</div>}>
                <FormationPlanning />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="budget">
              <Suspense fallback={<div className="text-zinc-400">Chargement...</div>}>
                <FormationBudget />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Suspense fallback={<div className="text-zinc-400">Chargement...</div>}>
                <FormationNotifications />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="dashboard">
              <Suspense fallback={<div className="text-zinc-400">Chargement...</div>}>
                <FormationDashboard />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="onboarding">
              <Suspense fallback={<div className="text-zinc-400">Chargement...</div>}>
                <FormationOnboarding />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="chat">
              <Suspense fallback={<div className="text-zinc-400">Chargement...</div>}>
                <Chatbox />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="ats">
              <Suspense fallback={<div className="text-zinc-400">Chargement...</div>}>
                {authChecking ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
                    <p>Vérification de l'authentification...</p>
                  </div>
                ) : isAuthenticated ? (
                  <FormationATS />
                ) : (
                  <div className="text-center py-12">
                    <p>Vous devez être connecté pour accéder à cette section.</p>
                    <button 
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => router.push('/login')}
                    >
                      Se connecter
                    </button>
                  </div>
                )}
              </Suspense>
            </TabsContent>
            
            <TabsContent value="paie">
              <Suspense fallback={<div className="text-zinc-400">Chargement...</div>}>
                <FormationPaie />
              </Suspense>
            </TabsContent>

            <TabsContent value="carburant">
              <Suspense fallback={<div className="text-zinc-400">Chargement...</div>}>
                <CarburantDashboard />
              </Suspense>
            </TabsContent>

            <TabsContent value="transactions">
              <Suspense fallback={<div className="text-zinc-400">Chargement...</div>}>
                <CarburantTransactions 
                  employeId="1"
                  employeNom="Marie Dupont"
                  transactions={transactionsSimulees}
                />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
