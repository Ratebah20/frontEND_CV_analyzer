"use client"

// Version simplifiée pour tester la redirection
export default function ManagerCandidatureDetailTestPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Détails de la candidature {params.id}</h1>
      <p>Cette page est une version simplifiée pour tester la redirection.</p>
    </div>
  )
}
