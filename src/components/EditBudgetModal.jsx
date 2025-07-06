"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";

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

export default function EditBudgetModal({
    open,
    onOpenChange,
    budget,
    onBudgetUpdated,
}) {
    const [formData, setFormData] = useState({
        totalBudget: "",
        category: "",
        month: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (budget) {
            setFormData({
                totalBudget: budget.totalBudget.toString(),
                category: budget.category,
                month: budget.month,
            });
        }
    }, [budget]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.totalBudget || !formData.category || !formData.month) {
            toast.error("All fields are required");
            return;
        }

        if (Number.parseFloat(formData.totalBudget) <= 0) {
            toast.error("Budget amount must be greater than 0");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                import.meta.env.VITE_BASE_URL+`/api/budget/editBudget/${budget._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...formData,
                        totalBudget: Number.parseFloat(formData.totalBudget),
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                toast.success("Budget updated successfully!");
                onOpenChange(false);
                if (onBudgetUpdated) {
                    onBudgetUpdated();
                }
            } else {
                toast.error(data.error || "Failed to update budget");
            }
        } catch (error) {
            toast.error(
                "Failed to update budget. Please check if the server is running."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Budget</DialogTitle>
                    <DialogDescription>
                        Update your monthly budget for this category.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="totalBudget">Budget Amount</Label>
                        <Input
                            id="totalBudget"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.totalBudget}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    totalBudget: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        category: value,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
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
                            <Label htmlFor="month">Month</Label>
                            <Select
                                value={formData.month}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, month: value })
                                }
                            >
                                <SelectTrigger>
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
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Updating..." : "Update Budget"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
