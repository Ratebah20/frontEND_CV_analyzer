import DetailEntretien from "@/components/ats/detail-entretien"

export default function DetailEntretienPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-6">
      <DetailEntretien params={params} />
    </div>
  )
}
