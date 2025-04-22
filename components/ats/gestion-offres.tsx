"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Edit, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import JobService, { JobPosition } from "@/app/services/job-service"

export default function GestionOffres() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  
  // Charger les données
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await JobService.getAllJobs();
        
        // Log pour debug
        console.log("Données des offres d'emploi:", data);
        
        if (Array.isArray(data)) {
          setJobs(data);
        } else {
          console.error("Format de données incorrect:", data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des offres d'emploi:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);
  
  // Modifier une offre
  const handleEdit = (id: number) => {
    console.log("Modifier l'offre:", id);
    router.push(`/modifier-offre/${id}`);
  };
  
  // Fonction handleDetails supprimée car non utilisée
  
  // Ajouter une offre
  const handleAddJob = () => {
    router.push("/ajouter-offre");
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
          Gestion des offres d'emploi
        </h1>
        <Button 
          onClick={handleAddJob}
          className="bg-green-500 hover:bg-green-600 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ajouter une offre
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Liste des offres d'emploi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement des offres d'emploi...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead>Candidatures</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow 
                    key={job.id} 
                    className={!job.is_active ? "opacity-60 bg-zinc-900/30" : ""}
                  >
                      <TableCell>{job.title}</TableCell>
                      <TableCell>{job.department_name || '???'}</TableCell>
                      <TableCell>
                        <Badge className={job.is_active ? "bg-green-500" : "bg-gray-500"}>
                          {job.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {job.created_at ? 
                          new Date(job.created_at).toLocaleDateString() : 
                          "Date inconnue"}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-500">
                          {job.application_count || 0} candidature(s)
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => handleEdit(job.id!)}
                            size="sm"
                            variant="outline"
                            className="flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {jobs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Aucune offre d'emploi trouvée
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
