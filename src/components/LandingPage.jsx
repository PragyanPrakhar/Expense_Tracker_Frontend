"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, List, BarChart3, LayoutDashboard } from "lucide-react"
import AddTransactionModal from "./AddTransactionModal"
import TransactionsList from "./TransactionsList"
import Analytics from "./Analytics"
import Dashboard from "./Dashboard"

export default function LandingPage() {
  const [activeView, setActiveView] = useState("home")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const renderContent = () => {
    switch (activeView) {
      case "transactions":
        return <TransactionsList />
      case "analytics":
        return <Analytics />
      case "dashboard":
        return <Dashboard />
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setIsAddModalOpen(true)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Add Transaction</CardTitle>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription>Click to add a new income or expense transaction</CardDescription>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveView("transactions")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">View Transactions</CardTitle>
                <List className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription>View and manage all your transactions</CardDescription>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveView("analytics")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription>View monthly expenses and category breakdown</CardDescription>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveView("dashboard")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dashboard</CardTitle>
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription>Overview of your financial summary</CardDescription>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction Tracker</h1>
          <p className="text-muted-foreground">Manage your finances with ease</p>
        </div>
        {activeView !== "home" && (
          <Button variant="outline" onClick={() => setActiveView("home")}>
            Back to Home
          </Button>
        )}
      </div>

      {renderContent()}

      <AddTransactionModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onTransactionAdded={() => {
          // Refresh data if we're on transactions or dashboard view
          if (activeView === "transactions" || activeView === "dashboard") {
            window.location.reload()
          }
        }}
      />
    </div>
  )
}
