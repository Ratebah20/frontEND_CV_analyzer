import ManagerDashboard from "@/components/ats/manager-dashboard"
import Sidebar from "@/components/sidebar"

export default function ManagerDashboardPage() {
  return (
    <div className="flex h-screen bg-zinc-900">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-zinc-950 text-white">
        <div className="p-8 max-w-6xl mx-auto">
          <ManagerDashboard />
        </div>
      </main>
    </div>
  )
}
