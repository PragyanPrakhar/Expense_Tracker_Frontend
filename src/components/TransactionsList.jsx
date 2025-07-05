"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Calendar, DollarSign } from "lucide-react"
import { toast } from "sonner"

export default function TransactionsList() {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_BASE_URL+"/api//transaction/recentTransactions?limit=50")
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      } else {
        toast.error("Failed to fetch transactions")
      }
    } catch (error) {
      toast.error("Failed to fetch transactions. Please check if the server is running.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()

    try {
      const response = await fetch(import.meta.env.VITE_API_URL+`/api//transaction/deleteTransaction/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Transaction deleted successfully!")
        fetchTransactions()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete transaction")
      }
    } catch (error) {
      toast.error("Failed to delete transaction. Please check if the server is running.")
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">All Transactions</h2>
        <p className="text-muted-foreground">{transactions.length} transactions found</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transactions.map((transaction) => (
          <Card
            key={transaction._id}
            className="cursor-pointer hover:shadow-lg transition-shadow relative"
            onClick={() => navigate(`/transaction/${transaction._id}`)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg truncate">{transaction.description}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={(e) => handleDelete(transaction._id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={transaction.type === "income" ? "default" : "secondary"}>{transaction.category}</Badge>
                <Badge variant={transaction.type === "income" ? "default" : "outline"}>{transaction.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(transaction.date)}
                </div>
                <div
                  className={`flex items-center gap-1 font-semibold ${
                    transaction.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <DollarSign className="h-4 w-4" />
                  {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No transactions found. Add your first transaction to get started!</p>
        </div>
      )}
    </div>
  )
}
