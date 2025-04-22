"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import InterviewService, { Interview } from "@/app/services/interview-service"

// Interface pour l'affichage des demandes d'entretien
interface InterviewRequest {
  id: number;
  candidate_name: string;
  job_title: string;
  department_name: string;
  manager: string;
  requested_date: string;
  status: string;
  application_id: number;
}

export default function GestionEntretiens() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<InterviewRequest[]>([]);
  
  // Charger les données depuis l'API
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        console.log('Chargement des demandes d\'entretien depuis l\'API...');
        
        // Appel à l'API réelle pour récupérer les entretiens
        const response = await InterviewService.getAllInterviews();
        console.log('Réponse de l\'API:', response);
        
        // Transformer les données pour correspondre à notre interface d'affichage
        const formattedInterviews: InterviewRequest[] = response.map((interview: any) => {
          console.log('Traitement de l\'entretien avec détails:', JSON.stringify(interview, null, 2));
          
          // Extraire les informations du candidat
          let candidateName = 'Candidat inconnu';
          if (interview.candidate) {
            if (interview.candidate.name) {
              candidateName = interview.candidate.name;
            } else if (interview.candidate.first_name || interview.candidate.last_name) {
              const firstName = interview.candidate.first_name || '';
              const lastName = interview.candidate.last_name || '';
              candidateName = `${firstName} ${lastName}`.trim();
            }
          }
          
          // Extraire les informations du poste
          let jobTitle = 'Poste non spécifié';
          if (interview.job && interview.job.title) {
            jobTitle = interview.job.title;
          }
          
          // Extraire les informations du département
          let departmentName = 'Département non spécifié';
          if (interview.department && interview.department.name) {
            departmentName = interview.department.name;
          } else if (interview.department_id) {
            departmentName = `Département ${interview.department_id}`;
          }
          
          // Extraire le manager
          let manager = 'Non spécifié';
          if (interview.manager_name) {
            manager = interview.manager_name;
          } else if (interview.requested_by) {
            manager = interview.requested_by;
          }
          
          // Formater la date
          let requestedDate = 'Date invalide';
          try {
            // Essayer d'abord requested_date (format API)
            if (interview.requested_date) {
              const date = new Date(interview.requested_date);
              if (!isNaN(date.getTime())) {
                requestedDate = date.toLocaleString('fr-FR');
              }
            } 
            // Si non disponible, essayer interview_date (ancien format)
            else if (interview.interview_date) {
              const date = new Date(interview.interview_date);
              if (!isNaN(date.getTime())) {
                requestedDate = date.toLocaleString('fr-FR');
              }
            }
          } catch (error) {
            console.error('Erreur lors du formatage de la date:', error);
          }
          
          // Déterminer le statut
          let status = interview.status || 'inconnu';
          
          return {
            id: interview.id,
            application_id: interview.application_id,
            candidate_name: candidateName,
            job_title: jobTitle,
            department_name: departmentName,
            manager: manager,
            requested_date: requestedDate,
            status: status
          };
        });
        
        console.log('Données formatées pour l\'affichage:', formattedInterviews);
        setInterviews(formattedInterviews);
      } catch (error) {
        console.error("Erreur lors du chargement des demandes d'entretien:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInterviews();
  }, []);
  
  const handleViewDetails = (id: number) => {
    console.log(`Redirection vers les détails de l'entretien: ${id}`);
    router.push(`/entretien/${id}`);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-500">Approuvé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">En attente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Refusé</Badge>;
      case 'inconnu':
        return <Badge className="bg-gray-500">Inconnu</Badge>;
      default:
        console.log(`Statut non géré: ${status}`);
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
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
          Demandes d'entretien
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Liste des demandes d'entretien</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement des demandes d'entretien...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidat</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Date demandée</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell>{interview.candidate_name}</TableCell>
                      <TableCell>{interview.job_title}</TableCell>
                      <TableCell>{interview.department_name}</TableCell>
                      <TableCell>{interview.manager}</TableCell>
                      <TableCell>{interview.requested_date}</TableCell>
                      <TableCell>
                        {getStatusBadge(interview.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => handleViewDetails(interview.id)}
                            size="sm"
                            variant="outline"
                            className="flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center text-blue-500 border-blue-500"
                            onClick={() => router.push(`/manager-candidatures/${interview.application_id}`)}
                          >
                            Candidature
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {interviews.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Aucune demande d'entretien trouvée
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
