"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, Calendar, PieChart } from "lucide-react"
import { toast } from "sonner"

export default function Dashboard() {
  const [totalExpense, setTotalExpense] = useState(0)
  const [categoryBreakdown, setCategoryBreakdown] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [totalResponse, categoryResponse, recentResponse] = await Promise.all([
        fetch(import.meta.env.VITE_BASE_URL+"/transaction/totalExpense"),
        fetch(import.meta.env.VITE_BASE_URL+"/transaction/categoryWiseExpense"),
        fetch(import.meta.env.VITE_BASE_URL+"/transaction/recentTransactions?limit=5"),
      ])

      if (totalResponse.ok && categoryResponse.ok && recentResponse.ok) {
        const totalData = await totalResponse.json()
        const categoryData = await categoryResponse.json()
        const recentData = await recentResponse.json()

        setTotalExpense(totalData.totalExpense)
        setCategoryBreakdown(categoryData)
        setRecentTransactions(recentData)
      } else {
        toast.error("Failed to fetch dashboard data")
      }
    } catch (error) {
      toast.error("Failed to fetch dashboard data. Please check if the server is running.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalExpense.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total amount spent across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categoryBreakdown.length > 0 ? categoryBreakdown[0].category : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {categoryBreakdown.length > 0
                ? `$${categoryBreakdown[0].total.toFixed(2)} spent`
                : "No expenses recorded"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentTransactions.length}</div>
            <p className="text-xs text-muted-foreground">Recent transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Your spending by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryBreakdown.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{category.category}</Badge>
                </div>
                <div className="text-right">
                  <div className="font-medium">${category.total.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">
                    {totalExpense > 0 ? ((category.total / totalExpense) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            ))}
            {categoryBreakdown.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No category data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Most Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{formatDate(transaction.date)}</span>
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {transaction.category}
                      </Badge>
                      <Badge variant={transaction.type === "income" ? "default" : "secondary"} className="text-xs">
                        {transaction.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                  {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No recent transactions</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
