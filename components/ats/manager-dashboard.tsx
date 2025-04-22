"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Eye, AlertTriangle, User, Briefcase } from "lucide-react"
import { useRouter } from "next/navigation"
import AuthService, { User as UserType } from "@/app/services/auth-service"
import CandidateService, { Candidate } from "@/app/services/candidate-service"
import JobService, { JobPosition } from "@/app/services/job-service"
import InterviewService, { Interview } from "@/app/services/interview-service"

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

export default function ManagerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Candidate[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    reviewing: 0,
    interview: 0
  });
  
  // États pour les données réelles
  const [recentInterviews, setRecentInterviews] = useState<Interview[]>([]);
  const [openPositions, setOpenPositions] = useState<JobPosition[]>([]);
  const [latestApplications, setLatestApplications] = useState<Candidate[]>([]);
  
  // Récupérer l'utilisateur courant et toutes les données nécessaires
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        setCurrentUser(user);
        console.log("Utilisateur connecté:", user);
        
        if (user && user.is_hr) {
          // Rediriger les RH vers leur page dédiée
          router.push('/candidatures');
          return;
        }
        
        if (user && !user.department_id) {
          setError("Votre compte n'est pas associé à un département. Veuillez contacter un administrateur.");
          return;
        }
        
        // Si l'utilisateur est un manager avec un département, charger toutes les données
        if (user && user.department_id) {
          await fetchAllDepartmentData(user.department_id);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        setError("Impossible de récupérer les informations de l'utilisateur.");
      }
    };
    
    // Fonction pour charger toutes les données du département
    const fetchAllDepartmentData = async (departmentId: number) => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. Charger les candidatures pour ce département
        const candidatesData = await CandidateService.getCandidatesByDepartment(departmentId);
        console.log(`Candidatures pour le département ${departmentId}:`, candidatesData);
        
        if (Array.isArray(candidatesData)) {
          setApplications(candidatesData);
          
          // Calculer les statistiques
          const total = candidatesData.length;
          const newApps = candidatesData.filter(app => Number(app.status) === 1).length;
          const reviewingApps = candidatesData.filter(app => Number(app.status) === 2).length;
          const interviewApps = candidatesData.filter(app => Number(app.status) === 3).length;
          
          setStats({
            total,
            new: newApps,
            reviewing: reviewingApps,
            interview: interviewApps
          });
          
          // Définir les dernières candidatures (top 5)
          const latestApps = candidatesData.slice(0, 5);
          setLatestApplications(latestApps);
        }
        
        // 2. Charger les postes ouverts pour ce département
        try {
          const jobsData = await JobService.getJobsByDepartment(departmentId);
          console.log(`Postes ouverts pour le département ${departmentId}:`, jobsData);
          setOpenPositions(jobsData);
        } catch (jobError) {
          console.error(`Erreur lors du chargement des postes pour le département ${departmentId}:`, jobError);
        }
        
        // 3. Charger les demandes d'entretien pour ce département
        try {
          const interviewsData = await InterviewService.getInterviewsByDepartment(departmentId);
          console.log(`Entretiens pour le département ${departmentId}:`, interviewsData);
          setRecentInterviews(interviewsData.slice(0, 3)); // Prendre les 3 plus récents
        } catch (interviewError) {
          console.error(`Erreur lors du chargement des entretiens pour le département ${departmentId}:`, interviewError);
          // Si l'API n'est pas encore implémentée, utiliser des données fictives temporaires
          setRecentInterviews([
            {
              id: 8,
              application_id: 1,
              candidate_id: 1,
              job_id: 1,
              department_id: departmentId,
              interview_date: "2025-04-24T21:21:00",
              status: "approved",
              created_at: "2025-04-21T00:00:00",
              updated_at: "2025-04-21T00:00:00"
            },
            {
              id: 4,
              application_id: 2,
              candidate_id: 2,
              job_id: 2,
              department_id: departmentId,
              interview_date: "2025-04-06T07:45:00",
              status: "approved",
              created_at: "2025-04-21T00:00:00",
              updated_at: "2025-04-21T00:00:00"
            },
            {
              id: 7,
              application_id: 3,
              candidate_id: 3,
              job_id: 3,
              department_id: departmentId,
              interview_date: "2025-04-04T04:16:00",
              status: "approved",
              created_at: "2025-04-20T00:00:00",
              updated_at: "2025-04-20T00:00:00"
            }
          ]);
        }
      } catch (error) {
        console.error(`Erreur lors du chargement des données pour le département ${departmentId}:`, error);
        setError("Impossible de charger les données. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentUser();
  }, [router]);
  
  // Voir les détails d'une candidature
  const handleViewDetails = (id: number) => {
    console.log("Redirection vers les détails de la candidature:", id);
    // Utiliser la chaîne directement pour la redirection
    router.push(`/manager-candidatures/${id}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Bienvenue, {currentUser?.username || "Manager"}
        </h1>
        <div>
          <Badge className="bg-blue-600 mr-2">
            Département: {currentUser?.department_name || "Non spécifié"}
          </Badge>
        </div>
      </div>
      
      {error && (
        <div className="flex items-center p-4 mb-4 text-amber-800 rounded-lg bg-amber-50 dark:bg-gray-800 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="max-w-4xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total des candidatures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="max-w-4xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Nouvelles candidatures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        
        <Card className="max-w-4xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              En cours d'examen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.reviewing}</div>
          </CardContent>
        </Card>
        
        <Card className="max-w-4xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Entretiens programmés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.interview}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Section des widgets */}
      <div className="flex flex-col space-y-6 mt-6">
        {/* Widget 1: Demandes d'entretien récentes */}
        <Card className="max-w-full">
          <CardHeader className="bg-blue-900 text-white py-2 px-4 rounded-t-lg">
            <CardTitle className="text-base font-medium">Demandes d'entretien récentes</CardTitle>
          </CardHeader>
          <CardContent className="px-0 py-0">
            <div className="divide-y">
              {recentInterviews.map(interview => (
                <div key={interview.id} className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium">Demande d'entretien #{interview.id}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(interview.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="text-sm">
                    Date demandée: {new Date(interview.interview_date).toLocaleString('fr-FR')}
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-sm mr-2">Statut:</span>
                    <Badge className="bg-green-500 text-white text-xs py-0 px-2 rounded-sm">
                      {interview.status === "approved" ? "Approuvé" : interview.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2 text-center">
              <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50 w-full">
                Voir toutes les demandes
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Conteneur pour les widgets côte à côte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Widget 2: Postes ouverts dans votre département */}
          <Card className="max-w-full">
            <CardHeader className="bg-blue-900 text-white py-2 px-4 rounded-t-lg">
              <CardTitle className="text-base font-medium">Postes ouverts dans votre département</CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Candidatures</TableHead>
                      <TableHead>Date de création</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {openPositions.slice(0, 6).map(position => (
                      <TableRow key={position.id}>
                        <TableCell className="py-2">{position.title}</TableCell>
                        <TableCell className="py-2">
                          <Badge className="bg-blue-500 text-white">
                            {position.application_count || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 text-sm">
                          {new Date(position.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {/* Widget 3: Dernières candidatures */}
          <Card className="max-w-full">
            <CardHeader className="bg-blue-900 text-white py-2 px-4 rounded-t-lg">
              <CardTitle className="text-base font-medium">Dernières candidatures</CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <div className="divide-y">
                {latestApplications.map(app => (
                <div key={app.id} className="p-3 cursor-pointer hover:bg-gray-50" onClick={() => handleViewDetails(app.id)}>
                  <div className="font-medium">
                    {app.candidate?.first_name} {app.candidate?.last_name}
                  </div>
                  <div className="text-sm">{app.job?.title}</div>
                  <div className="flex items-center mt-1">
                    <span className="text-sm mr-2">Statut:</span>
                    <span className={`text-sm ${Number(app.status) === 5 ? 'text-green-600' : Number(app.status) === 4 ? 'text-red-600' : 'text-orange-600'}`}>
                      {Number(app.status) === 1 ? 'Nouvelle' : 
                       Number(app.status) === 2 ? 'En examen' : 
                       Number(app.status) === 3 ? 'Entretien' : 
                       Number(app.status) === 4 ? 'Rejetée' : 'Acceptée'}
                    </span>
                  </div>
                </div>
              ))}
              </div>
              <div className="p-2 text-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-600 border-blue-600 hover:bg-blue-50 w-full"
                  onClick={() => router.push('/manager-candidatures')}
                >
                  Voir toutes les candidatures
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Tableau des candidatures */}
      <Card className="max-w-full">
        <CardHeader>
          <CardTitle>
            Candidatures pour le département {currentUser?.department_name || ""}
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
                    <TableHead>Date</TableHead>
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
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            {application.candidate?.first_name} {application.candidate?.last_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                            {application.job?.title || "N/A"}
                          </div>
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
                          ) : Number(application.status) === 5 ? (
                            <Badge className="bg-green-600">
                              Accepté
                            </Badge>
                          ) : (
                            <Badge>
                              {application.status_text || "Inconnu"}
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
                            className="flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Aucune candidature trouvée pour votre département
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
