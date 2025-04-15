"use client";

import React from "react";
import { useState } from "react";
import { Control, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import employeeSchema from "@/validations/Admin.validation";
import adminSchema from "@/validations/Employee.validation";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { cn } from "@/lib/utils";
import { createAdmin, createEmployee } from "@/app/serverActions/onboarding";
import { toast } from "sonner";

type EmployeeFormValues = z.infer<typeof employeeSchema>;
type AdminFormValues = z.infer<typeof adminSchema>;

interface onBoardingFormProps {
  userEmail: string;
  firstName: string;
  lastName: string;
}

interface FormInputProps {
  name: string;
  label: string;
  control: Control<any>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const OnboardingForm = ({
  userEmail,
  firstName,
  lastName,
}: onBoardingFormProps) => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [accountType, setAccountType] = useState<"admin" | "employee">(
    "employee"
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const employeeForm = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName,
      lastName,
      email: userEmail,
      department: "",
      invitationCode: "",
    },
  });

  const adminForm = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      firstName,
      lastName,
      email: userEmail,
      companyName: "",
      companyWebsite: "",
      companyLogo: "",
    },
  });

  const handleEmployeeSubmit = async (data: EmployeeFormValues) => {
    if (!user) {
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const reponse = await createEmployee(
        data.department || undefined,
        user.id,
        data.invitationCode
      );
      if (reponse?.success) {
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      console.log(`Error creating Employee: ${error}`);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to compelete onboarding"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminSubmit = async (data: AdminFormValues) => {
    if (!user) {
      return;
    }

    let canRedirect = false;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createAdmin(
        data.companyName,
        data.companyWebsite || "",
        data.companyLogo || "",
        user.id
      );
      if (response?.success) {
        console.log("Admin created successfully");
        canRedirect = true;
        router.push("/admin");
      }
    } catch (error) {
      console.error(`Error creating admin: ${error}`);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to complete onboarding. Please try again. "
      );
    } finally {
      setIsSubmitting(false);
    }

    if (canRedirect) {
      console.log("Redirecting to employee");
      toast.success(
        "Onboarding completed successfully."
      );
      window.location.reload();
    }
  };

  const RenderFormField: React.FC<FormInputProps> = ({
    name,
    label,
    control,
    placeholder,
    disabled = false,
    className,
  }) => {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                {...field}
                disabled={disabled}
                placeholder={placeholder}
                className={className}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  return (
    <Card className="border border-gray-300">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Complete your account setup
        </CardTitle>
        <CardDescription>
          Weclome to TimeOffer! Let&apos;s get you onboarded.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Account Type</Label>
            <RadioGroup
              defaultValue="employee"
              value={accountType}
              onValueChange={(value) =>
                setAccountType(value as "admin" | "employee")
              }
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="employee"
                  id="employee"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="employee"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-md border-2 border-gray-300 bg-popover p-4 hover:bg-gray-300 hover:text-accent-foreground",
                    accountType === "employee" &&
                      "bg-gray-300 text-accent-foreground"
                  )}
                >
                  <span>Employee</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="admin"
                  id="admin"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="admin"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-gray-300  bg-popover p-4 hover:bg-gray-300 hover:text-accent-foreground"
                >
                  <span>Business Admin</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          <Separator />

          {accountType === "employee" ? (
            <Form {...employeeForm}>
              <form onSubmit={employeeForm.handleSubmit(handleEmployeeSubmit)}>
                <div className="grid grid-cols-2 gap-4">
                  <RenderFormField
                    name="firstName"
                    label="First Name"
                    control={employeeForm.control}
                    disabled
                    className="bg-gray-100"
                  />
                  <RenderFormField
                    name="lastName"
                    label="Last Name"
                    control={employeeForm.control}
                    className="bg-gray-100"
                  />
                </div>
                <RenderFormField
                  name="email"
                  label="Email"
                  control={employeeForm.control}
                  disabled
                  className="bg-gray-100"
                />
                <RenderFormField
                  name="department"
                  label="Department (Optional)"
                  control={employeeForm.control}
                  className="bg-gray-100"
                  placeholder="e.g. Engineering, sales, etc."
                />
                <FormField
                  control={employeeForm.control}
                  name="invitationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invitation Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter the 6-digit code"
                          className="bg-gray-100"
                          maxLength={6}
                          pattern="[0-9]{6}"
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the 6-digit invitation code provided by your
                        company admin.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && (
                  <Alert variant={"destructive"}>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing" : "Complete Setup"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...adminForm}>
              <form
                onSubmit={adminForm.handleSubmit(handleAdminSubmit)}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-md font-medium mb-2">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <RenderFormField
                      name="firstName"
                      label="First Name"
                      control={adminForm.control}
                      disabled
                      className="bg-gray-100"
                    />
                    <RenderFormField
                      name="lastName"
                      label="Last Name"
                      control={adminForm.control}
                      className="bg-gray-100"
                    />
                  </div>
                  <RenderFormField
                    name="email"
                    label="Email"
                    control={adminForm.control}
                    disabled
                    className="bg-gray-100"
                  />
                  <Separator />
                  <div>
                    <h3 className="text-md font-medium mb-2">
                      Company Information
                    </h3>
                    <RenderFormField
                      name="companyName"
                      label="Company Name"
                      control={adminForm.control}
                      placeholder="Company Name"
                      className="bg-gray-100"
                    />
                    <RenderFormField
                      name="companyWebsite"
                      label="Company Website"
                      control={adminForm.control}
                      placeholder="Company Website (Optional)"
                      className="bg-gray-100"
                    />
                    <RenderFormField
                      name="companyLogo"
                      label="Company Logo"
                      control={adminForm.control}
                      placeholder="Company Logo URL"
                      className="bg-gray-100"
                    />
                    {error && (
                      <Alert variant={"destructive"}>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing" : "Complete Setup"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingForm;
