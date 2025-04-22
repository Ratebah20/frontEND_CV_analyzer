"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Mail, Phone, Calendar, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import AuthService, { User as UserType } from "@/app/services/auth-service"
import CandidateService, { Candidate } from "@/app/services/candidate-service"
import InterviewService from "@/app/services/interview-service"

// Statuts pour les badges
const statusMap: Record<string | number, { label: string, color: string }> = {
  1: { label: 'Soumise', color: 'bg-blue-500' },
  2: { label: 'En cours d\'examen', color: 'bg-yellow-500' },
  3: { label: 'Entretien', color: 'bg-orange-500' },
  4: { label: 'Rejetée', color: 'bg-red-500' },
  5: { label: 'Acceptée', color: 'bg-green-500' }
};

export default function ManagerCandidatureDetail({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Candidate | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Récupérer l'utilisateur courant et les détails de la candidature
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
          router.push(`/candidatures/${id}`);
          return;
        }
        
        if (!user || !user.department_id) {
          setError("Votre compte n'est pas associé à un département. Veuillez contacter un administrateur.");
          setLoading(false);
          return;
        }
        
        // 2. Récupérer les détails de la candidature
        const applicationData = await CandidateService.getCandidateById(Number(id));
        console.log(`Détails de la candidature ${id}:`, applicationData);
        
        // Vérifier que la candidature appartient au département du manager
        if (applicationData) {
          // Comparer le département du job avec celui du manager
          // Note: selon la structure de données, nous utilisons department ou department_id
          // Dans la base de données normalisée, department est une clé étrangère numérique
          const jobDepartmentId = applicationData.job?.department ? 
                                 (typeof applicationData.job.department === 'string' ? 
                                  parseInt(applicationData.job.department) : 
                                  applicationData.job.department) : 
                                 null;
          
          console.log("Département du job:", jobDepartmentId, "Département du manager:", user.department_id);
          
          // Pour le développement, on accepte tous les départements temporairement
          setApplication(applicationData);
          
          /* Commenter cette vérification pour le développement
          if (jobDepartmentId === user.department_id) {
            setApplication(applicationData);
          } else {
            setError("Vous n'avez pas accès à cette candidature.");
            router.push('/manager-dashboard');
          }
          */
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError("Impossible de charger les détails de la candidature. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, router]);

  // Retourner à la liste des candidatures
  const handleBackToList = () => {
    router.push('/manager-candidatures');
  };

  // Demander un entretien
  const handleRequestInterview = async () => {
    if (!application || !currentUser) return;
    
    if (!interviewDate || !interviewTime) {
      alert("Veuillez sélectionner une date et une heure pour l'entretien.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Créer une date combinée pour l'entretien
      const combinedDateTime = `${interviewDate}T${interviewTime}:00`;
      
      // Créer une demande d'entretien
      await InterviewService.createInterview({
        application_id: application.id,
        candidate_id: application.candidate?.id || 0,
        job_id: application.job?.id || 0,
        department_id: currentUser.department_id,
        interview_date: combinedDateTime,
        status: "pending",
        notes: comments
      });
      
      // Mettre à jour le statut de la candidature
      await CandidateService.updateCandidateStatus(Number(application.id), "3"); // 3 = Entretien
      
      alert("Demande d'entretien envoyée avec succès !");
      
      // Recharger la page pour voir les changements
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la demande d'entretien:", error);
      alert("Une erreur est survenue lors de la demande d'entretien. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des détails de la candidature...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p>Candidature non trouvée.</p>
              <Button onClick={handleBackToList} className="mt-4">
                Retour à la liste
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">
            Détails de la candidature
          </h1>
        </div>
        <Button 
          variant="outline" 
          onClick={handleBackToList}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour aux candidatures</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations du candidat */}
        <Card>
          <CardHeader className="bg-blue-600 text-white py-2 px-4 rounded-t-lg">
            <CardTitle className="text-base font-medium">Informations du candidat</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="font-medium text-lg">
                {application.candidate?.first_name} {application.candidate?.last_name}
              </div>
              
              {application.candidate?.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{application.candidate.email}</span>
                </div>
              )}
              
              {application.candidate?.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{application.candidate.phone}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Candidature soumise le {new Date(application.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <span className="font-medium">Statut:</span>
                <Badge className={statusMap[Number(application.status)]?.color || 'bg-gray-500'}>
                  {statusMap[Number(application.status)]?.label || 'Inconnu'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Informations sur le poste */}
        <Card>
          <CardHeader className="bg-blue-600 text-white py-2 px-4 rounded-t-lg">
            <CardTitle className="text-base font-medium">Poste: {application.job?.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <div className="font-medium mb-1">Description</div>
                <p className="text-sm text-gray-600">{application.job?.description || "Aucune description disponible."}</p>
              </div>
              
              <div>
                <div className="font-medium mb-1">Prérequis</div>
                <p className="text-sm text-gray-600">
                  {/* Utiliser la description comme fallback pour les prérequis */}
                  {application.job?.description ? "Inclus dans la description" : "Aucun prérequis spécifié."}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">Département:</span>
                <span>{currentUser?.department_name || "Non spécifié"}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Publié le {application.created_at ? new Date(application.created_at).toLocaleDateString('fr-FR') : "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Documents */}
        <Card>
          <CardHeader className="bg-blue-600 text-white py-2 px-4 rounded-t-lg">
            <CardTitle className="text-base font-medium">Documents</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* Vérifier si le CV est disponible */}
            {application.candidate ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span>CV du candidat</span>
                </div>
                <Button variant="outline" size="sm">
                  Télécharger
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md">
                Le fichier CV n'est pas disponible.
              </div>
            )}
            
            {/* Vérifier si la lettre de motivation est disponible */}
            {application.candidate ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md mt-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span>Lettre de motivation</span>
                </div>
                <Button variant="outline" size="sm">
                  Télécharger
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md mt-2">
                La lettre de motivation n'est pas disponible.
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Analyse et actions */}
        <Card>
          <CardHeader className="bg-blue-600 text-white py-2 px-4 rounded-t-lg">
            <CardTitle className="text-base font-medium">Analyse et actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Demande d'entretien</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date souhaitée</label>
                    <div className="flex space-x-2">
                      <Input 
                        type="date" 
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full"
                      />
                      <Input 
                        type="time" 
                        value={interviewTime}
                        onChange={(e) => setInterviewTime(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Commentaires</label>
                    <Textarea 
                      placeholder="Ajoutez des informations supplémentaires concernant l'entretien..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full"
                      rows={4}
                    />
                  </div>
                  
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleRequestInterview}
                    disabled={isSubmitting || Number(application.status) === 3}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Traitement en cours...
                      </>
                    ) : Number(application.status) === 3 ? (
                      "Entretien déjà programmé"
                    ) : (
                      "Demander un entretien"
                    )}
                  </Button>
                </div>
              </div>
              
              {application.ai_score && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Score IA</h3>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          Number(application.ai_score) >= 80 ? 'bg-green-500' : 
                          Number(application.ai_score) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${application.ai_score}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 font-medium">{application.ai_score}%</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
