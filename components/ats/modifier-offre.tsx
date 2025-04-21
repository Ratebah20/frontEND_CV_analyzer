"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import JobService, { JobPosition } from "@/app/services/job-service"

interface ModifierOffreProps {
  jobId: string | number;
}

export default function ModifierOffre({ jobId }: ModifierOffreProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<JobPosition>({
    title: "",
    description: "",
    requirements: "",
    department: "",
    is_active: true
  });
  
  // Liste des départements disponibles
  const departments = [
    "Informatique",
    "Marketing",
    "Finance",
    "Ressources Humaines",
    "Recherche et Développement",
    "Ventes",
    "Juridique",
    "Production",
    "Logistique"
  ];
  
  // Style personnalisé pour les champs du formulaire
  const inputStyle = "bg-zinc-900 border border-zinc-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-75 ease-in-out text-white";
  const textareaStyle = "bg-zinc-900 border border-zinc-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-75 ease-in-out resize-none text-white";
  const labelStyle = "text-sm font-medium text-zinc-300 mb-1 block";
  
  // Charger les données de l'offre
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        // S'assurer que jobId est converti en nombre
        const id = Number(jobId);
        if (isNaN(id)) {
          throw new Error("ID d'offre invalide");
        }
        
        const data = await JobService.getJobById(id);
        
        // Log pour debug
        console.log("Données de l'offre:", data);
        
        if (data) {
          setFormData(data);
        } else {
          console.error("Offre non trouvée");
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'offre:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (jobId) {
      fetchJobData();
    }
  }, [jobId]);
  
  // Gérer les changements des champs du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Gérer les changements du menu déroulant
  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Gérer les changements de checkbox
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_active: checked
    }));
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de base
    if (!formData.title || !formData.description || !formData.department) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // S'assurer que jobId est converti en nombre
      const id = Number(jobId);
      if (isNaN(id)) {
        throw new Error("ID d'offre invalide");
      }
      
      const response = await JobService.updateJob(id, {
        ...formData,
        is_active: formData.is_active
      });
      
      console.log("Offre mise à jour avec succès:", response);
      
      // Rediriger vers la liste des offres
      router.push("/gestion-offres");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'offre:", error);
      alert("Une erreur est survenue lors de la mise à jour de l'offre. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
        <h1 className="text-xl font-bold flex items-center text-white">
          <button 
            onClick={() => router.push('/gestion-offres')} 
            className="p-2 mr-2 rounded-full hover:bg-zinc-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          Modifier une offre d'emploi
        </h1>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-zinc-400">Chargement des données de l'offre...</span>
        </div>
      ) : (
        <Card className="border border-zinc-800 bg-zinc-950 shadow-md rounded-md">
          <CardHeader className="border-b border-zinc-800 pb-4">
            <CardTitle className="text-xl font-semibold text-white">Formulaire de modification</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className={labelStyle}>Titre du poste</Label>
                  <Input 
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ex: Développeur Full Stack"
                    className={inputStyle}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className={labelStyle}>Description du poste</Label>
                  <Textarea 
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Décrivez le poste de manière détaillée. Ces informations seront utilisées par l'IA pour analyser les CV."
                    className={textareaStyle}
                    rows={5}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="requirements" className={labelStyle}>Exigences / Compétences requises</Label>
                  <Textarea 
                    id="requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="Listez les compétences, qualifications et expérience requises pour ce poste."
                    className={textareaStyle}
                    rows={5}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="department" className={labelStyle}>Département</Label>
                  <Select 
                    value={formData.department} 
                    onValueChange={(value) => handleSelectChange(value, "department")}
                  >
                    <SelectTrigger 
                      id="department" 
                      className={`${inputStyle} w-full`}
                    >
                      <SelectValue placeholder="Sélectionnez un département" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border border-zinc-700 text-white">
                      {departments.map((dept) => (
                        <SelectItem 
                          key={dept} 
                          value={dept}
                          className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer"
                        >
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-zinc-500 mt-1">
                    Département auquel ce poste est rattaché. Important pour le filtrage par les managers.
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="is_active" 
                    checked={formData.is_active}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="is_active" className="text-zinc-300">Poste actif</Label>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/gestion-offres')}
                  className="bg-zinc-900 border-0 text-white hover:bg-zinc-800"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-150"
                >
                  {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
