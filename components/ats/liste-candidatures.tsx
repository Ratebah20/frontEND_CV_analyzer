"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import CandidateService, { Candidate } from "@/app/services/candidate-service"
import { Loader2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

// Statuts pour les badges
const statusMap: Record<string | number, { label: string, color: string }> = {
  'SUBMITTED': { label: 'Soumise', color: 'bg-blue-500' },
  'REVIEWING': { label: 'En cours d\'analyse', color: 'bg-yellow-500' },
  'INTERVIEW': { label: 'Entretien', color: 'bg-green-500' },
  'REJECTED': { label: 'Rejeté', color: 'bg-red-500' },
  'HIRED': { label: 'Accepté', color: 'bg-emerald-500' },
  // Ajout des correspondances numériques
  1: { label: 'Soumise', color: 'bg-blue-500' },
  2: { label: 'En cours d\'examen', color: 'bg-yellow-500' },
  3: { label: 'Entretien', color: 'bg-orange-500' },
  4: { label: 'Rejeté', color: 'bg-red-500' },
  5: { label: 'Accepté', color: 'bg-green-500' }
};

// Fonction pour obtenir le niveau du score
const getScoreLevel = (score?: number): { label: string, color: string } => {
  if (!score) return { label: 'Non analysé', color: 'text-gray-500' };
  
  if (score >= 90) return { label: 'Excellent', color: 'text-emerald-500' };
  if (score >= 80) return { label: 'Bon', color: 'text-green-500' };
  if (score >= 70) return { label: 'Moyen', color: 'text-yellow-500' };
  return { label: 'Faible', color: 'text-red-500' };
};

export default function ListeCandidatures() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Candidate[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Candidate[]>([]);
  const [posteFilter, setPosteFilter] = useState<string>("all");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  
  const [postes, setPostes] = useState<string[]>([]);
  const [statuts, setStatuts] = useState<string[]>([]);
  
  // Charger les données
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await CandidateService.getAllCandidates();
        
        // Log pour debug
        console.log("Données des candidatures:", data);
        
        if (Array.isArray(data)) {
          setApplications(data);
          setFilteredApplications(data);
          
          // Extraire les postes uniques
          const uniquePostes = [...new Set(data.map(app => 
            app.job?.title || 'Non spécifié'
          ))];
          setPostes(uniquePostes);
          
          // Extraire les statuts uniques
          const uniqueStatuts = [...new Set(data.map(app => app.status))];
          setStatuts(uniqueStatuts);
        } else {
          console.error("Format de données incorrect:", data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des candidatures:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, []);
  
  // Filtrer les candidatures
  useEffect(() => {
    let filtered = [...applications];
    
    if (posteFilter !== "all") {
      filtered = filtered.filter(app => app.job?.title === posteFilter);
    }
    
    if (statutFilter !== "all") {
      filtered = filtered.filter(app => app.status === statutFilter);
    }
    
    setFilteredApplications(filtered);
  }, [posteFilter, statutFilter, applications]);
  
  // Gérer le filtre
  const handleFilter = () => {
    // Cette fonction est appelée au clic sur le bouton Filtrer
    // Le filtrage est déjà géré par l'useEffect ci-dessus
    console.log("Filtres appliqués:", { poste: posteFilter, statut: statutFilter });
  };
  
  // Voir les détails d'une candidature
  const handleViewDetails = (id: number) => {
    // Rediriger vers la page de détails
    console.log("Voir détails de la candidature:", id);
    router.push(`/candidatures/${id}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center">
          <button 
            onClick={() => router.back()} 
            className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          Gestion des candidatures
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Poste</label>
              <Select 
                value={posteFilter} 
                onValueChange={setPosteFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les postes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les postes</SelectItem>
                  {postes.map(poste => (
                    <SelectItem key={poste} value={poste}>{poste}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Statut</label>
              <Select 
                value={statutFilter} 
                onValueChange={setStatutFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {statuts.map(statut => (
                    <SelectItem key={statut} value={statut}>
                      {statusMap[statut]?.label || statut}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={handleFilter} className="bg-blue-500 hover:bg-blue-600">
                Filtrer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Liste des candidatures</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement des candidatures...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidat</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Score IA</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        {application.candidate ? 
                          `${application.candidate.first_name} ${application.candidate.last_name}` : 
                          "Candidat inconnu"}
                      </TableCell>
                      <TableCell>{application.job?.title || "Non spécifié"}</TableCell>
                      <TableCell>
                        {application.created_at ? 
                          new Date(application.created_at).toLocaleDateString() : 
                          "Date inconnue"}
                      </TableCell>
                      <TableCell>
                        {Number(application.status) === 1 ? (
                          <Badge className="bg-blue-500 text-white py-1 px-3 rounded-full">
                            Soumise
                          </Badge>
                        ) : Number(application.status) === 2 ? (
                          <Badge className="bg-cyan-500 text-white py-1 px-3 rounded-full">
                            En cours d'examen
                          </Badge>
                        ) : Number(application.status) === 3 ? (
                          <Badge className="bg-yellow-500 text-black py-1 px-3 rounded-full">
                            Entretien
                          </Badge>
                        ) : Number(application.status) === 4 ? (
                          <Badge className="bg-red-500 text-white py-1 px-3 rounded-full">
                            Rejeté
                          </Badge>
                        ) : Number(application.status) === 5 ? (
                          <Badge className="bg-green-600 text-white py-1 px-3 rounded-full">
                            Accepté
                          </Badge>
                        ) : (
                          <Badge className={statusMap[application.status]?.color || "bg-gray-500"}>
                            {statusMap[application.status]?.label || application.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {application.ai_score ? (
                          <div className="flex items-center">
                            <span className={`font-medium ${application.ai_score >= 90 ? 'text-emerald-500' : 
                                            application.ai_score >= 80 ? 'text-green-500' : 
                                            application.ai_score >= 70 ? 'text-yellow-500' : 
                                            'text-red-500'}`}>
                              {application.ai_score.toFixed(1)}%
                            </span>
                            <span className="ml-2 text-sm text-gray-400">
                              {application.ai_score >= 90 ? 'Excellent' : 
                               application.ai_score >= 80 ? 'Bon' : 
                               application.ai_score >= 70 ? 'Moyen' : 
                               'Faible'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Non analysé</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          onClick={() => handleViewDetails(application.id)}
                          size="sm"
                          variant="outline"
                          className="flex items-center bg-transparent hover:bg-zinc-800 text-blue-500 border border-blue-500 rounded-md px-3 py-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredApplications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Aucune candidature trouvée avec ces critères
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
