import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MetricsCard } from "@/components/metrics-card"
import { StatsChart } from "@/components/stats-chart"
import { VaultTable } from "@/components/vault-table"
import { 
  BarChart3, 
  ChevronDown, 
  Ticket, 
  Users, 
  Computer, 
  Box, 
  Settings, 
  Search,
  Plus,
  Filter
} from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="grid lg:grid-cols-[280px_1fr]">
        <aside className="border-r bg-background/50 backdrop-blur">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Ticket className="h-6 w-6" />
            <span className="font-bold">ZenTicket</span>
          </div>
          <div className="px-4 py-4">
            <Input placeholder="Rechercher un ticket" className="bg-background/50" />
          </div>
          <nav className="space-y-2 px-2">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Ticket className="h-4 w-4" />
              Tickets
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Computer className="h-4 w-4" />
              Matériel
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Box className="h-4 w-4" />
              Inventaire
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistiques
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Settings className="h-4 w-4" />
              Paramètres
            </Button>
          </nav>
        </aside>
        <main className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Tableau de bord des tickets</h1>
              <div className="text-sm text-muted-foreground">Vue d'ensemble des tickets</div>
            </div>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Ticket
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricsCard
              title="Tickets Ouverts"
              value="24"
              change={{ value: "+3", percentage: "+12%", isPositive: false }}
            />
            <MetricsCard
              title="En cours"
              value="15"
              change={{ value: "+5", percentage: "+33%", isPositive: true }}
            />
            <MetricsCard
              title="Résolus (7j)"
              value="45"
              change={{ value: "+12", percentage: "+26%", isPositive: true }}
            />
          </div>
          <Card className="mt-6 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Activité des tickets</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">
                  Aujourd'hui
                </Button>
                <Button size="sm" variant="ghost">
                  Cette semaine
                </Button>
                <Button size="sm" variant="ghost">
                  Ce mois
                </Button>
              </div>
            </div>
            <StatsChart />
          </Card>
          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Liste des tickets récents</h2>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtrer
              </Button>
            </div>
            <VaultTable />
          </div>
        </main>
      </div>
    </div>
  )
}

