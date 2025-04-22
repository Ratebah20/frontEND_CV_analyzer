"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Calendar, Clock, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// Interface temporaire - à remplacer par votre modèle de données réel
interface InterviewDetails {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_date: string;
  requested_by: string;
  request_date: string;
  comments: string;
  candidate: {
    name: string;
    email: string;
    phone: string;
    application_date: string;
    application_status: string;
  };
  job: {
    title: string;
    department: string;
  };
}

export default function DetailEntretien({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState<InterviewDetails | null>(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewLocation, setInterviewLocation] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  
  // Simuler le chargement des données
  useEffect(() => {
    // Remplacer par un appel API réel
    const fetchInterviewDetails = async () => {
      try {
        setLoading(true);
        // Données simulées pour l'exemple - à remplacer par un appel API réel
        const mockData: InterviewDetails = {
          id: parseInt(params.id),
          status: "approved",
          requested_date: "06/04/2025 à 07:45",
          requested_by: "manager_info (<Department Direction Générale>)",
          request_date: "21/04/2025",
          comments: "Lieu: Zoom\nNotes: zdzqdqz\n\nCe candidat a un profil intéressant. J'aimerais le rencontrer pour discuter de ses compétences techniques.",
          candidate: {
            name: "Lucas Bernard",
            email: "lucas.bernard@email.com",
            phone: "0612345678",
            application_date: "21/04/2025",
            application_status: "Entretien"
          },
          job: {
            title: "Développeur Full Stack",
            department: "<Department Direction Générale>"
          }
        };
        
        setInterview(mockData);
      } catch (error) {
        console.error("Erreur lors du chargement des détails de l'entretien:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInterviewDetails();
  }, [params.id]);
  
  const handlePlanInterview = () => {
    // Implémenter la logique pour planifier l'entretien
    console.log("Planification de l'entretien:", {
      interviewDate,
      interviewTime,
      interviewLocation,
      interviewNotes
    });
    
    // Feedback à l'utilisateur
    alert("Entretien planifié avec succès!");
    
    // Rediriger vers la liste des entretiens
    router.push("/gestion-entretiens");
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approuvé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">En attente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Refusé</Badge>;
      default:
        return <Badge className="bg-gray-500">Inconnu</Badge>;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des détails de l'entretien...</span>
      </div>
    );
  }
  
  if (!interview) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold">Entretien non trouvé</h2>
        <Button 
          onClick={() => router.push("/gestion-entretiens")}
          className="mt-4"
        >
          Retour à la liste des entretiens
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center">
          <button 
            onClick={() => router.push("/gestion-entretiens")} 
            className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          Demande d'entretien
        </h1>
        
        <Button 
          variant="outline"
          onClick={() => router.push("/gestion-entretiens")}
        >
          ← Retour aux demandes
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Détails de la demande</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Statut:</strong>{" "}
              {getStatusBadge(interview.status)}
            </div>
            <div>
              <strong>Date demandée:</strong>{" "}
              {interview.requested_date}
            </div>
            <div>
              <strong>Demandé par:</strong>{" "}
              {interview.requested_by}
            </div>
            <div>
              <strong>Date de la demande:</strong>{" "}
              {interview.request_date}
            </div>
            <div>
              <strong>Commentaires:</strong>
              <div className="mt-2 bg-gray-100 dark:bg-zinc-900 p-3 rounded whitespace-pre-line">
                {interview.comments}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Candidature: {interview.candidate.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <strong>Informations du candidat</strong>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                {interview.candidate.email}
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                {interview.candidate.phone}
              </div>
            </div>
            
            <div>
              <strong>Poste:</strong>{" "}
              {interview.job.title}
            </div>
            <div>
              <strong>Département:</strong>{" "}
              {interview.job.department}
            </div>
            <div>
              <strong>Statut de la candidature:</strong>{" "}
              <Badge className="bg-blue-500">
                {interview.candidate.application_status}
              </Badge>
            </div>
            <div>
              <strong>Candidature soumise le:</strong>{" "}
              {interview.candidate.application_date}
            </div>
            
            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={() => console.log("Voir la candidature complète")}
            >
              Voir la candidature complète
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Planifier l'entretien</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Date de l'entretien
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  type="date"
                  className="pl-10"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">
                Heure de l'entretien
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  type="time"
                  className="pl-10"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">
                Lieu
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Salle de réunion, Zoom, etc."
                  className="pl-10"
                  value={interviewLocation}
                  onChange={(e) => setInterviewLocation(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">
              Notes pour l'entretien
            </label>
            <Textarea
              placeholder="Informations supplémentaires pour l'entretien..."
              className="min-h-[100px]"
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
            />
          </div>
          
          <Button
            onClick={handlePlanInterview}
            className="w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar mr-2">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
            Planifier l'entretien
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
