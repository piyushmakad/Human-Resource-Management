"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateEmployeeAllowance } from "@/app/serverActions/admin-actions";

interface AllowanceFormProps {
  employeeId: string;
  employeeName: string;
  currentAllowance: number;
}

export default function AllowanceForm({
  employeeId,
  employeeName,
  currentAllowance,
}: AllowanceFormProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [allowance, setAllowance] = useState<number>(currentAllowance);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateEmployeeAllowance({
        employeeId,
        availableDays: allowance,
      });

      if (result.success) {
        toast.success("Allowance updated successfully");
        setIsOpen(false);
        setAllowance(currentAllowance);
      }
    } catch (error) {
      console.error("Error updating allowance:", error);
      toast.error("Failed to update allowance. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Holiday Allowance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Label htmlFor="emp-name">Employee</Label>
            <Input id="emp-name" value={employeeName} disabled />
          </div>
          <div className="space-y-4">
            <Label htmlFor="allowance">Holiday allowance (days)</Label>
            <Input
              id="allowance"
              type="number"
              min={0}
              value={allowance}
              onChange={(e) => setAllowance(parseInt(e.target.value))}
              required
            />
          </div>
          <Button type="submit" className="w-full mt-4" disabled={isSubmitting} >
            {isSubmitting ? "Updating..." : "Update Allowance"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
