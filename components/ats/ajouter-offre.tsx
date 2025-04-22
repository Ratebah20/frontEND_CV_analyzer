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
import JobService from "@/app/services/job-service"
import DepartmentService, { Department } from "@/services/DepartmentService"

export default function AjouterOffre() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    department_id: 0,
    is_active: true
  });
  
  // État pour stocker les départements chargés depuis l'API
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Charger les départements depuis l'API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoading(true);
        const deptData = await DepartmentService.getDepartments();
        setDepartments(deptData);
      } catch (error) {
        console.error("Erreur lors du chargement des départements:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDepartments();
  }, []);
  
  // Style personnalisé pour les champs du formulaire
  const inputStyle = "bg-zinc-900 border border-zinc-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-75 ease-in-out text-white";
  const textareaStyle = "bg-zinc-900 border border-zinc-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-75 ease-in-out resize-none text-white";
  const labelStyle = "text-sm font-medium text-zinc-300 mb-1 block";
  
  
  // Gérer les changements des champs du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Gérer les changements du menu déroulant pour les départements
  const handleDepartmentChange = (departmentId: string) => {
    const id = parseInt(departmentId, 10);
    setFormData((prev) => ({
      ...prev,
      department_id: id
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
    if (!formData.title || !formData.description || !formData.department_id) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await JobService.createJob({
        ...formData,
        is_active: formData.is_active
      });
      
      console.log("Offre créée avec succès:", response);
      
      // Rediriger vers la liste des offres
      router.push("/gestion-offres");
    } catch (error) {
      console.error("Erreur lors de la création de l'offre:", error);
      alert("Une erreur est survenue lors de la création de l'offre. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
        <h1 className="text-xl font-bold flex items-center text-white">
          <button 
            onClick={() => router.back()} 
            className="p-2 mr-2 rounded-full hover:bg-zinc-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          Ajouter une offre d'emploi
        </h1>
      </div>
      
      <Card className="border border-zinc-800 bg-zinc-950 shadow-md rounded-md">
        <CardHeader className="border-b border-zinc-800 pb-4">
          <CardTitle className="text-xl font-semibold text-white">Formulaire</CardTitle>
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
                <Label htmlFor="department_id" className={labelStyle}>Département</Label>
                {isLoading ? (
                  <div className="flex items-center justify-center py-3 border border-zinc-700 rounded bg-zinc-900">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
                    <span className="text-zinc-400">Chargement des départements...</span>
                  </div>
                ) : (
                  <Select 
                    value={formData.department_id ? formData.department_id.toString() : ""} 
                    onValueChange={handleDepartmentChange}
                  >
                    <SelectTrigger 
                      id="department_id" 
                      className={`${inputStyle} w-full`}
                    >
                      <SelectValue placeholder="Sélectionnez un département" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border border-zinc-700 text-white">
                      {departments.map((dept) => (
                        <SelectItem 
                          key={dept.id} 
                          value={dept.id.toString()}
                          className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer"
                        >
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
                onClick={() => router.back()}
                className="bg-zinc-900 border-0 text-white hover:bg-zinc-800"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-150"
              >
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
