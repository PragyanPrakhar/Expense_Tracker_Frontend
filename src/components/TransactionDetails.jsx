"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";

const categories = ["Food", "Rent", "Shopping", "Travel", "Bills", "Other"];
const types = ["expense", "income"];

export default function TransactionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [editData, setEditData] = useState({});

    useEffect(() => {
        fetchTransaction();
    }, [id]);

    const fetchTransaction = async () => {
        try {
            const response = await fetch(
                import.meta.env.VITE_BASE_URL +
                    "/api/transaction/recentTransactions?limit=10"
            );
            if (response.ok) {
                const data = await response.json();
                const foundTransaction = data.find((t) => t._id === id);

                if (foundTransaction) {
                    setTransaction(foundTransaction);
                    setEditData({
                        amount: foundTransaction.amount.toString(),
                        date: foundTransaction.date.split("T")[0],
                        description: foundTransaction.description,
                        category: foundTransaction.category,
                        type: foundTransaction.type,
                    });
                } else {
                    toast.error("Transaction not found");
                    navigate("/");
                }
            } else {
                toast.error("Failed to fetch transaction details");
            }
        } catch (error) {
            toast.error(
                "Failed to fetch transaction details. Please check if the server is running."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (
            !editData.amount ||
            !editData.date ||
            !editData.description ||
            !editData.category
        ) {
            toast.error("All fields are required");
            return;
        }

        try {
            const response = await fetch(
                import.meta.env.BASE_URL + `/transaction/editTransaction/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...editData,
                        amount: Number.parseFloat(editData.amount),
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                toast.success("Transaction updated successfully!");
                setTransaction(data.transaction);
                setIsEditing(false);
            } else {
                const data = await response.json();
                toast.error(data.error || "Failed to update transaction");
            }
        } catch (error) {
            toast.error(
                "Failed to update transaction. Please check if the server is running."
            );
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!transaction) {
        return (
            <div className="container mx-auto p-6">
                <Button
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="mb-6"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Button>
                <p>Transaction not found</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <Button variant="outline" onClick={() => navigate("/")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Button>
                <div className="flex gap-2">
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button onClick={handleSave}>
                                <Save className="mr-2 h-4 w-4" />
                                Save
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl">
                            Transaction Details
                        </CardTitle>
                        <div className="flex gap-2">
                            <Badge
                                variant={
                                    transaction.type === "income"
                                        ? "default"
                                        : "secondary"
                                }
                            >
                                {transaction.category}
                            </Badge>
                            <Badge
                                variant={
                                    transaction.type === "income"
                                        ? "default"
                                        : "outline"
                                }
                            >
                                {transaction.type}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!isEditing ? (
                        <>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">
                                    Description
                                </Label>
                                <p className="text-lg font-medium">
                                    {transaction.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Amount
                                    </Label>
                                    <p
                                        className={`text-2xl font-bold ${
                                            transaction.type === "income"
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {transaction.type === "income"
                                            ? "+"
                                            : "-"}
                                        ${transaction.amount.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Date
                                    </Label>
                                    <p className="text-lg">
                                        {formatDate(transaction.date)}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Category
                                    </Label>
                                    <p className="text-lg">
                                        {transaction.category}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Type
                                    </Label>
                                    <p className="text-lg capitalize">
                                        {transaction.type}
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={editData.description}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        value={editData.amount}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                amount: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={editData.date}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                date: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={editData.category}
                                        onValueChange={(value) =>
                                            setEditData({
                                                ...editData,
                                                category: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category}
                                                    value={category}
                                                >
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={editData.type}
                                        onValueChange={(value) =>
                                            setEditData({
                                                ...editData,
                                                type: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {types.map((type) => (
                                                <SelectItem
                                                    key={type}
                                                    value={type}
                                                >
                                                    {type
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        type.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
