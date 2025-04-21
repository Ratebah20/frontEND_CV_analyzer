"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, Download, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import CandidateService from "@/app/services/candidate-service"
import ApplicationService from "@/app/services/application-service"
import { API_URL } from "@/app/services/api-config"

// Statuts pour les badges et le select
const statusMap: Record<string, { label: string, color: string }> = {
  'SUBMITTED': { label: 'Soumise', color: 'bg-blue-500' },
  'REVIEWING': { label: 'En cours d\'analyse', color: 'bg-yellow-500' },
  'INTERVIEW': { label: 'Entretien', color: 'bg-green-500' },
  'REJECTED': { label: 'Rejeté', color: 'bg-red-500' },
  'HIRED': { label: 'Accepté', color: 'bg-emerald-500' }
};

// Valeurs numériques des statuts
const statusValues: Record<string, number> = {
  'SUBMITTED': 1,
  'REVIEWING': 2,
  'INTERVIEW': 3,
  'REJECTED': 4,
  'HIRED': 5
};

// Mapping inverse (nombre vers chaîne)
const statusValuesReverse: Record<number, string> = {
  1: 'SUBMITTED',
  2: 'REVIEWING',
  3: 'INTERVIEW',
  4: 'REJECTED',
  5: 'HIRED'
};

interface DetailsProps {
  candidatureId: string | number;
}

export default function DetailsCandidature({ candidatureId }: DetailsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [candidature, setCandidature] = useState<any>(null);
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Charger les données de la candidature
  useEffect(() => {
    const fetchCandidature = async () => {
      try {
        setLoading(true);
        // S'assurer que candidatureId est converti en nombre
        const id = Number(candidatureId);
        if (isNaN(id)) {
          throw new Error("ID de candidature invalide");
        }
        
        const data = await CandidateService.getCandidateById(id);
        
        // Log pour debug
        console.log("Données de la candidature:", data);
        
        if (data) {
          // Convertir le statut numérique en chaîne
          const statusNumeric = Number(data.status);
          const statusKey = statusValuesReverse[statusNumeric] || "SUBMITTED";
          
          // Mettre à jour les données avec le statut texte pour l'affichage
          const updatedData = {
            ...data,
            status_text: statusMap[statusKey]?.label || "Statut inconnu"
          };
          
          setCandidature(updatedData);
          setCurrentStatus(statusKey);
          
          console.log("Statut converti:", { 
            original: data.status, 
            key: statusKey, 
            text: statusMap[statusKey]?.label 
          });
        } else {
          console.error("Candidature non trouvée");
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la candidature:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (candidatureId) {
      fetchCandidature();
    }
  }, [candidatureId]);
  
  // Mettre à jour le statut
  const handleStatusUpdate = async () => {
    if (!candidature || !currentStatus) return;
    
    try {
      setIsUpdatingStatus(true);
      
      // Convertir le statut en valeur numérique
      const statusValue = statusValues[currentStatus];
      if (statusValue === undefined) {
        throw new Error("Statut invalide");
      }
      
      // S'assurer que l'ID est un nombre
      const applicationId = Number(candidature.id);
      if (isNaN(applicationId)) {
        throw new Error("ID de candidature invalide");
      }
      
      await ApplicationService.updateApplicationStatus(applicationId, statusValue);
      
      // Mettre à jour l'état local
      setCandidature({
        ...candidature,
        status: currentStatus,
        status_text: statusMap[currentStatus]?.label || currentStatus
      });
      
      console.log("Statut mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  
  // Analyser le CV avec l'IA
  const handleAnalyzeCV = async () => {
    if (!candidature) return;
    
    try {
      setIsAnalyzing(true);
      
      // Appel à l'API réelle pour analyser le CV
      const applicationId = Number(candidature.id);
      if (isNaN(applicationId)) {
        throw new Error("ID de candidature invalide");
      }
      
      const result = await ApplicationService.analyzeCV(applicationId);
      
      // Mettre à jour l'état local avec le résultat de l'analyse
      setCandidature({
        ...candidature,
        ai_analysis: result.ai_analysis || "Aucune analyse disponible",
        ai_score: result.ai_score || 0
      });
      
      console.log("CV analysé avec succès");
    } catch (error) {
      console.error("Erreur lors de l'analyse du CV:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Télécharger le CV
  const handleDownloadCV = () => {
    if (!candidature || !candidature.cv_filename) return;
    
    // Construire l'URL de téléchargement
    const downloadUrl = `${API_URL}/static/uploads/${candidature.cv_filename}`;
    
    // Ouvrir l'URL dans un nouvel onglet
    window.open(downloadUrl, '_blank');
  };
  
  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <button 
            onClick={() => router.push('/candidatures')} 
            className="p-2 mr-3 rounded-full hover:bg-zinc-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          Détails de la candidature
        </h1>
        <Button 
          onClick={() => router.push('/candidatures')}
          variant="outline" 
          className="border-zinc-700 hover:bg-zinc-800"
        >
          Retour aux candidatures
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-zinc-400">Chargement des détails...</span>
        </div>
      ) : candidature ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations du candidat */}
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader className="border-b border-zinc-800">
              <CardTitle>Informations du candidat</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label className="text-zinc-400 text-sm">Nom:</Label>
                <p className="font-medium">
                  {candidature.candidate ? 
                    `${candidature.candidate.first_name} ${candidature.candidate.last_name}` : 
                    "Non spécifié"}
                </p>
              </div>
              
              <div>
                <Label className="text-zinc-400 text-sm">Email:</Label>
                <p className="font-medium">{candidature.candidate?.email || "Non spécifié"}</p>
              </div>
              
              <div>
                <Label className="text-zinc-400 text-sm">Téléphone:</Label>
                <p className="font-medium">{candidature.candidate?.phone || "Non spécifié"}</p>
              </div>
              
              <div>
                <Label className="text-zinc-400 text-sm">Candidature soumise le:</Label>
                <p className="font-medium">
                  {candidature.created_at ? 
                    new Date(candidature.created_at).toLocaleDateString() + " à " + 
                    new Date(candidature.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                    "Date inconnue"}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* CV et lettre de motivation */}
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader className="border-b border-zinc-800">
              <CardTitle>CV et lettre de motivation</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {candidature.cv_filename ? (
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-400" />
                    <span>{candidature.cv_filename}</span>
                  </div>
                  <Button 
                    onClick={handleDownloadCV}
                    variant="outline"
                    className="flex items-center border-zinc-700 hover:bg-zinc-800"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger le CV
                  </Button>
                </div>
              ) : (
                <p className="text-zinc-400">Aucun CV fourni.</p>
              )}
              
              <div className="pt-4">
                <Label className="text-zinc-400 text-sm">Lettre de motivation:</Label>
                {candidature.cover_letter ? (
                  <div className="mt-2 p-4 bg-zinc-800 rounded-md">
                    <p className="whitespace-pre-wrap">{candidature.cover_letter}</p>
                  </div>
                ) : (
                  <p className="text-zinc-400 mt-2">Aucune lettre de motivation fournie.</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Poste */}
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader className="border-b border-zinc-800">
              <CardTitle>Poste</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label className="text-zinc-400 text-sm">Titre:</Label>
                <p className="font-medium">{candidature.job?.title || "Non spécifié"}</p>
              </div>
              
              <div>
                <Label className="text-zinc-400 text-sm">Département:</Label>
                <p className="font-medium">{candidature.job?.department || "Non spécifié"}</p>
              </div>
              
              <div>
                <Label className="text-zinc-400 text-sm">Description:</Label>
                <p className="mt-1 text-sm text-zinc-300 whitespace-pre-wrap">
                  {candidature.job?.description || "Aucune description disponible."}
                </p>
              </div>
              
              <div>
                <Label className="text-zinc-400 text-sm">Exigences:</Label>
                <p className="mt-1 text-sm text-zinc-300 whitespace-pre-wrap">
                  {candidature.job?.requirements || "Aucune exigence spécifiée."}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Statut de la candidature */}
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader className="border-b border-zinc-800">
              <CardTitle>Statut de la candidature</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label className="text-zinc-400 text-sm">Statut actuel:</Label>
                <div className="mt-2">
                  <Badge className={statusMap[currentStatus]?.color || "bg-zinc-500"}>
                    {candidature.status_text || statusMap[currentStatus]?.label || "Statut inconnu"}
                  </Badge>
                </div>
              </div>
              
              <div className="pt-2">
                <Label className="text-zinc-400 text-sm mb-2 block">Mettre à jour le statut:</Label>
                <div className="flex gap-4">
                  <Select 
                    value={currentStatus} 
                    onValueChange={setCurrentStatus}
                  >
                    <SelectTrigger className="w-[200px] bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusMap).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    onClick={handleStatusUpdate}
                    disabled={isUpdatingStatus || currentStatus === candidature.status}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isUpdatingStatus ? "Mise à jour..." : "Mettre à jour"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Analyse IA du CV */}
          <Card className="border-zinc-800 bg-zinc-900 md:col-span-2">
            <CardHeader className="border-b border-zinc-800">
              <div className="flex justify-between items-center">
                <CardTitle>Analyse IA du CV</CardTitle>
                <Button 
                  onClick={handleAnalyzeCV}
                  disabled={isAnalyzing || !candidature.cv_filename}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    "Analyser le CV"
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {candidature.ai_analysis ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-zinc-400 text-sm">Score de correspondance:</Label>
                    <div className="flex items-center mt-2">
                      <div className="w-full bg-zinc-800 rounded-full h-4 mr-4">
                        <div 
                          className="bg-blue-600 h-4 rounded-full" 
                          style={{ width: `${candidature.ai_score || 0}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{candidature.ai_score || 0}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-zinc-400 text-sm">Analyse:</Label>
                    <div className="mt-2 p-4 bg-zinc-800 rounded-md">
                      <p className="whitespace-pre-wrap">{candidature.ai_analysis}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-900/20 border border-blue-800 rounded-md p-4 text-blue-100">
                  <p className="mb-2">Aucune analyse IA n'a été effectuée pour cette candidature.</p>
                  <p>Cliquez sur le bouton "Analyser le CV" pour lancer l'analyse avec l'IA d'OpenAI.</p>
                  <p className="mt-2 text-sm">Note: Assurez-vous d'avoir configuré une clé API OpenAI valide dans votre fichier d'environnement.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12 text-zinc-400">
          Candidature non trouvée ou erreur lors du chargement.
        </div>
      )}
    </div>
  );
}
