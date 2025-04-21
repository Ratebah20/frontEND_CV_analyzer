"use client"

import { useRouter, usePathname } from "next/navigation"
import { 
  BookOpen, 
  Briefcase,
  Users,
  Settings,
  Search,
  Ticket,
  PlusCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  
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
        <button 
          onClick={() => router.push('/')} 
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${pathname === '/' ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Accueil</span>
        </button>
        
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
        
        <div className="border-t border-zinc-800 my-2 pt-2"></div>
        
        <button 
          onClick={() => router.push('/settings')} 
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${pathname === '/settings' ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
        >
          <Settings className="h-4 w-4" />
          <span>Paramètres</span>
        </button>
      </nav>
    </aside>
  )
}
