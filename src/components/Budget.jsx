"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    Plus,
    Trash2,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Edit,
} from "lucide-react";
import { toast } from "sonner";
import AddBudgetModal from "./AddBudgetModal";
import EditBudgetModal from "./EditBudgetModal";

const categories = ["Food", "Rent", "Shopping", "Travel", "Bills", "Other"];
const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export default function Budget() {
    const [budgets, setBudgets] = useState([]);
    const [budgetComparison, setBudgetComparison] = useState([]);
    const [spendingInsights, setSpendingInsights] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(
        months[new Date().getMonth()]
    );

    useEffect(() => {
        fetchBudgetData();
    }, [selectedMonth]);

    const fetchBudgetData = async () => {
        try {
            const [budgetsResponse, expensesResponse, overBudgetResponse] =
                await Promise.all([
                    fetch(import.meta.env.VITE_BASE_URL+"/api/budget/getBudgets"),
                    fetch(
                        import.meta.env.VITE_BASE_URL+"/api/transaction/categoryWiseExpense"
                    ),
                    fetch(
                        import.meta.env.VITE_BASE_URL+"/api/budget/overBudgetCategories"
                    ),
                ]);

            if (
                budgetsResponse.ok &&
                expensesResponse.ok &&
                overBudgetResponse.ok
            ) {
                const budgetsData = await budgetsResponse.json();
                const expensesData = await expensesResponse.json();
                const overBudgetData = await overBudgetResponse.json();

                setBudgets(budgetsData);

                // Create budget vs actual comparison
                const comparison = budgetsData
                    .filter((budget) => budget.month === selectedMonth)
                    .map((budget) => {
                        const actualExpense = expensesData.find(
                            (expense) => expense.category === budget.category
                        );
                        const actual = actualExpense ? actualExpense.total : 0;
                        const percentage =
                            budget.totalBudget > 0
                                ? (actual / budget.totalBudget) * 100
                                : 0;

                        return {
                            category: budget.category,
                            budget: budget.totalBudget,
                            actual: actual,
                            percentage: Math.round(percentage),
                            status:
                                percentage > 100
                                    ? "over"
                                    : percentage > 80
                                    ? "warning"
                                    : "good",
                        };
                    });

                setBudgetComparison(comparison);

                // Generate spending insights
                const insights = generateSpendingInsights(
                    comparison,
                    expensesData,
                    overBudgetData
                );
                setSpendingInsights(insights);
            } else {
                toast.error("Failed to fetch budget data");
            }
        } catch (error) {
            toast.error(
                "Failed to fetch budget data. Please check if the server is running."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const generateSpendingInsights = (comparison, expenses, overBudgetData) => {
        const insights = [];

        // Over budget categories from backend
        const overBudget = overBudgetData.filter(
            (item) =>
                item.totalSpent > item.budgetAmount && item.budgetAmount > 0
        );
        if (overBudget.length > 0) {
            insights.push({
                type: "warning",
                title: "Over Budget Alert",
                description: `You're over budget in ${overBudget.length} ${
                    overBudget.length === 1 ? "category" : "categories"
                } this month`,
                icon: AlertTriangle,
            });
        }

        // Good spending categories
        const goodSpending = comparison.filter(
            (item) => item.status === "good"
        );
        if (goodSpending.length > 0) {
            insights.push({
                type: "success",
                title: "Great Job!",
                description: `You're staying within budget for ${
                    goodSpending.length
                } ${goodSpending.length === 1 ? "category" : "categories"}`,
                icon: CheckCircle,
            });
        }

        // Highest spending category
        if (expenses.length > 0) {
            const highest = expenses.reduce((prev, current) =>
                prev.total > current.total ? prev : current
            );
            insights.push({
                type: "info",
                title: "Top Spending Category",
                description: `${
                    highest.category
                } accounts for $${highest.total.toFixed(2)} of your expenses`,
                icon: TrendingUp,
            });
        }

        return insights;
    };

    const handleDeleteBudget = async (id) => {
        try {
            const response = await fetch(
                import.meta.env.VITE_BASE_URL+`/api/budget/deleteBudget/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (response.ok) {
                toast.success("Budget deleted successfully!");
                // fetchBudgetData();
                window.location.reload(); // Reload to refresh data
            } else {
                const data = await response.json();
                toast.error(data.error || "Failed to delete budget");
            }
        } catch (error) {
            toast.error(
                "Failed to delete budget. Please check if the server is running."
            );
        }
    };

    const handleEditBudget = (budget) => {
        setEditingBudget(budget);
        setIsEditModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Budget Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-32 bg-gray-200 rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Budget Management</h2>
                <div className="flex gap-4">
                    <Select
                        value={selectedMonth}
                        onValueChange={setSelectedMonth}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month) => (
                                <SelectItem key={month} value={month}>
                                    {month}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Budget
                    </Button>
                </div>
            </div>

            {/* Budget Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgetComparison.map((item) => (
                    <Card key={item.category}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">
                                    {item.category}
                                </CardTitle>
                                <Badge
                                    variant={
                                        item.status === "over"
                                            ? "destructive"
                                            : item.status === "warning"
                                            ? "secondary"
                                            : "default"
                                    }
                                >
                                    {item.percentage}%
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>
                                        Budget: ${item.budget.toFixed(2)}
                                    </span>
                                    <span>
                                        Spent: ${item.actual.toFixed(2)}
                                    </span>
                                </div>
                                <Progress
                                    value={Math.min(item.percentage, 100)}
                                    className={`h-2 ${
                                        item.status === "over"
                                            ? "bg-red-100"
                                            : ""
                                    }`}
                                />
                                <div className="text-xs text-muted-foreground">
                                    {item.status === "over"
                                        ? `Over by $${(
                                              item.actual - item.budget
                                          ).toFixed(2)}`
                                        : `Remaining: $${(
                                              item.budget - item.actual
                                          ).toFixed(2)}`}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Budget vs Actual Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Budget vs Actual Spending - {selectedMonth}
                    </CardTitle>
                    <CardDescription>
                        Compare your planned budget with actual expenses
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={budgetComparison}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                formatter={(value, name) => [
                                    `$${value.toFixed(2)}`,
                                    name === "budget" ? "Budget" : "Actual",
                                ]}
                                labelStyle={{ color: "#000" }}
                            />
                            <Bar
                                dataKey="budget"
                                fill="#8884d8"
                                name="budget"
                            />
                            <Bar
                                dataKey="actual"
                                fill="#82ca9d"
                                name="actual"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Spending Insights */}
            <Card>
                <CardHeader>
                    <CardTitle>Spending Insights</CardTitle>
                    <CardDescription>
                        Smart insights about your spending patterns
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {spendingInsights.map((insight, index) => {
                            const Icon = insight.icon;
                            return (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 border rounded-lg"
                                >
                                    <Icon
                                        className={`h-5 w-5 mt-0.5 ${
                                            insight.type === "warning"
                                                ? "text-orange-500"
                                                : insight.type === "success"
                                                ? "text-green-500"
                                                : "text-blue-500"
                                        }`}
                                    />
                                    <div>
                                        <h4 className="font-medium">
                                            {insight.title}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {insight.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        {spendingInsights.length === 0 && (
                            <p className="text-muted-foreground text-center py-4">
                                Add some budgets and transactions to see
                                spending insights!
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* All Budgets List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Budgets</CardTitle>
                    <CardDescription>
                        Manage your monthly category budgets
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {budgets.map((budget) => (
                            <div
                                key={budget._id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline">
                                        {budget.category}
                                    </Badge>
                                    <span className="font-medium">
                                        ${budget.totalBudget.toFixed(2)}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        for {budget.month}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                        onClick={() => handleEditBudget(budget)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() =>
                                            handleDeleteBudget(budget._id)
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {budgets.length === 0 && (
                            <p className="text-muted-foreground text-center py-4">
                                No budgets set yet. Click "Add Budget" to get
                                started!
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <AddBudgetModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onBudgetAdded={fetchBudgetData}
            />
            <EditBudgetModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                budget={editingBudget}
                onBudgetUpdated={fetchBudgetData}
            />
        </div>
    );
}
