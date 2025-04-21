import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import CandidateService, { Candidate } from "@/app/services/candidate-service"
import { Loader2 } from "lucide-react"

// Interface pour mapper les données de l'API vers notre format d'affichage
interface Candidat {
  id: string
  nom: string
  prenom: string
  poste: string
  dateApplication: string
  statut: "nouveau" | "en_revue" | "entretien" | "rejeté" | "embauché"
  score: number
  competences: string[]
}

// Fonction pour convertir le statut de l'API vers notre format
const mapStatusToUI = (status: string): "nouveau" | "en_revue" | "entretien" | "rejeté" | "embauché" => {
  const statusMap: Record<string, "nouveau" | "en_revue" | "entretien" | "rejeté" | "embauché"> = {
    'SUBMITTED': 'nouveau',
    'REVIEWING': 'en_revue',
    'INTERVIEW': 'entretien',
    'REJECTED': 'rejeté',
    'HIRED': 'embauché'
  };
  return statusMap[status] || 'nouveau';
}

// Fonction pour convertir les données de l'API vers notre format
const mapCandidateToUI = (candidate: Candidate): Candidat => {
  // Ajouter des vérifications pour éviter les erreurs
  console.log('Structure du candidat reçue de l\'API:', candidate);
  
  // Extraire le prénom et le nom avec vérification
  let prenom = '';
  let nom = '';
  
  if (candidate && candidate.candidate) {
    prenom = candidate.candidate.first_name || '';
    nom = candidate.candidate.last_name || '';
  }
  
  // Calculer un score aléatoire pour la démonstration (à remplacer par un vrai score)
  const score = Math.floor(Math.random() * 30) + 70; // Score entre 70 et 100
  
  // Extraire des compétences avec vérification
  let competences = ['Compétence 1', 'Compétence 2', 'Compétence 3'];
  if (candidate && candidate.ai_analysis) {
    competences = candidate.ai_analysis.split(',').slice(0, 3);
  }
  
  // Construire l'objet avec vérifications
  return {
    id: candidate.id ? candidate.id.toString() : '0',
    nom,
    prenom,
    poste: candidate.job && candidate.job.title ? candidate.job.title : 'Non spécifié',
    dateApplication: candidate.created_at 
      ? new Date(candidate.created_at).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    statut: candidate.status ? mapStatusToUI(candidate.status) : 'nouveau',
    score,
    competences
  };
}

// Les données seront chargées depuis l'API

const statutColors = {
  nouveau: "bg-blue-500",
  en_revue: "bg-yellow-500",
  entretien: "bg-green-500",
  rejeté: "bg-red-500",
  embauché: "bg-purple-500"
}

export default function FormationATS() {
  const [candidats, setCandidats] = useState<Candidat[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Charger les données depuis l'API
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const response = await CandidateService.getAllCandidates();
        console.log('Données reçues de l\'API:', response);
        
        // Vérifier que la réponse est un tableau
        if (!Array.isArray(response)) {
          console.error('La réponse de l\'API n\'est pas un tableau:', response);
          setError("Format de données incorrect. Veuillez contacter l'administrateur.");
          setLoading(false);
          return;
        }
        
        // Convertir les données de l'API vers notre format
        const formattedCandidates = response.map(mapCandidateToUI);
        setCandidats(formattedCandidates);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des candidats:', error);
        setError("Impossible de charger les candidats. Veuillez réessayer plus tard.");
        setLoading(false);
      }
    };
    
    fetchCandidates();
  }, [])

  const candidatsFiltres = candidats.filter(candidat => 
    candidat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidat.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidat.poste.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tableau de bord ATS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{candidats.length}</div>
                <p className="text-xs text-muted-foreground">Total Candidats</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {candidats.filter(c => c.statut === "nouveau").length}
                </div>
                <p className="text-xs text-muted-foreground">Nouveaux</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {candidats.filter(c => c.statut === "entretien").length}
                </div>
                <p className="text-xs text-muted-foreground">En Entretien</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {candidats.filter(c => c.statut === "embauché").length}
                </div>
                <p className="text-xs text-muted-foreground">Embauchés</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 h-12" 
              size="lg"
              onClick={() => window.location.href = '/candidatures'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Voir toutes les candidatures
            </Button>
            <Button 
              className="flex items-center justify-center bg-green-500 hover:bg-green-600 h-12" 
              size="lg"
              onClick={() => window.location.href = '/ajouter-offre'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Ajouter une offre d'emploi
            </Button>
            <Button 
              className="flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 h-12" 
              size="lg"
              onClick={() => window.location.href = '/gestion-offres'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Gérer les offres d'emploi
            </Button>
            <Button 
              className="flex items-center justify-center bg-amber-500 hover:bg-amber-600 h-12" 
              size="lg"
              // Pour l'instant, ce bouton ne fait rien comme demandé
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Nouvelles candidatures
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestion des Candidats</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Rechercher un candidat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[300px]"
              />
              <Button>Importer CV</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement des candidats...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <Tabs defaultValue="tous">
              <TabsList>
                <TabsTrigger value="tous">Tous</TabsTrigger>
                <TabsTrigger value="nouveau">Nouveaux</TabsTrigger>
                <TabsTrigger value="en_revue">En Revue</TabsTrigger>
                <TabsTrigger value="entretien">Entretien</TabsTrigger>
                <TabsTrigger value="embauché">Embauchés</TabsTrigger>
              </TabsList>
              <TabsContent value="tous">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidat</TableHead>
                      <TableHead>Poste</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidatsFiltres.map((candidat) => (
                      <TableRow key={candidat.id}>
                        <TableCell>
                          <div className="font-medium">
                            {candidat.prenom} {candidat.nom}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {candidat.competences.join(", ")}
                          </div>
                        </TableCell>
                        <TableCell>{candidat.poste}</TableCell>
                        <TableCell>{candidat.dateApplication}</TableCell>
                        <TableCell>
                          <Badge className={statutColors[candidat.statut]}>
                            {candidat.statut.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={candidat.score} className="w-[100px]" />
                            <span>{candidat.score}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Voir CV
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}