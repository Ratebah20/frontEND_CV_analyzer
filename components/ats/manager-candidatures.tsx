"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Eye, ArrowLeft, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import AuthService, { User as UserType } from "@/app/services/auth-service"
import CandidateService, { Candidate } from "@/app/services/candidate-service"

// Statuts pour les badges
const statusMap: Record<string | number, { label: string, color: string }> = {
  'SUBMITTED': { label: 'Soumise', color: 'bg-blue-500' },
  'REVIEWING': { label: 'En cours d\'analyse', color: 'bg-yellow-500' },
  'INTERVIEW': { label: 'Entretien', color: 'bg-green-500' },
  'REJECTED': { label: 'Rejeté', color: 'bg-red-500' },
  'HIRED': { label: 'Accepté', color: 'bg-emerald-500' },
  // Ajout des correspondances numériques
  1: { label: 'Nouvelle', color: 'bg-blue-500' },
  2: { label: 'En cours d\'examen', color: 'bg-yellow-500' },
  3: { label: 'Entretien', color: 'bg-orange-500' },
  4: { label: 'Rejeté', color: 'bg-red-500' },
  5: { label: 'Accepté', color: 'bg-green-500' }
};

export default function ManagerCandidatures() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Candidate[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Récupérer l'utilisateur courant et les candidatures du département
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Récupérer l'utilisateur courant
        const user = await AuthService.getCurrentUser();
        setCurrentUser(user);
        
        if (user && user.is_hr) {
          // Rediriger les RH vers leur page dédiée
          router.push('/candidatures');
          return;
        }
        
        if (!user || !user.department_id) {
          setError("Votre compte n'est pas associé à un département. Veuillez contacter un administrateur.");
          setLoading(false);
          return;
        }
        
        // 2. Récupérer les candidatures pour ce département
        const candidatesData = await CandidateService.getCandidatesByDepartment(user.department_id);
        console.log(`Candidatures pour le département ${user.department_id}:`, candidatesData);
        
        if (Array.isArray(candidatesData)) {
          setApplications(candidatesData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError("Impossible de charger les candidatures. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router]);

  // Voir les détails d'une candidature
  const handleViewDetails = (id: number) => {
    router.push(`/manager-candidatures/${id}`);
  };

  // Retourner au tableau de bord
  const handleBackToDashboard = () => {
    router.push('/manager-dashboard');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleBackToDashboard}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            Candidatures - {currentUser?.department_name || "Département"}
          </h1>
        </div>
      </div>
      
      {/* Affichage des erreurs */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Tableau des candidatures */}
      <Card className="max-w-full">
        <CardHeader>
          <CardTitle>
            Liste des candidatures pour le département {currentUser?.department_name || ""}
          </CardTitle>
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
                    <TableHead>Département</TableHead>
                    <TableHead>Date de candidature</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Score AI</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.length > 0 ? (
                    applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">
                          {application.candidate?.first_name} {application.candidate?.last_name}
                        </TableCell>
                        <TableCell>
                          {application.job?.title || "N/A"}
                        </TableCell>
                        <TableCell>
                          {currentUser?.department_name || "N/A"}
                        </TableCell>
                        <TableCell>
                          {new Date(application.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {Number(application.status) === 1 ? (
                            <Badge className="bg-blue-500">
                              Nouvelle
                            </Badge>
                          ) : Number(application.status) === 2 ? (
                            <Badge className="bg-yellow-500">
                              En examen
                            </Badge>
                          ) : Number(application.status) === 3 ? (
                            <Badge className="bg-orange-500">
                              Entretien
                            </Badge>
                          ) : Number(application.status) === 4 ? (
                            <Badge className="bg-red-500">
                              Rejeté
                            </Badge>
                          ) : (
                            <Badge className="bg-green-500">
                              Accepté
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {application.ai_score ? `${application.ai_score}%` : 'Non analysé'}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center space-x-1"
                            onClick={() => handleViewDetails(application.id)}
                          >
                            <Eye className="h-4 w-4" />
                            <span>Voir</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Aucune candidature trouvée pour ce département
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
