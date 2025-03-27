"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control, useForm } from "react-hook-form";
import { Alert, AlertDescription } from "./ui/alert";
import companyProfileSchema from "@/validations/CompanyProfile.validation";
import { updateCompanyProfile } from "@/app/serverActions/admin-actions";
import { toast } from "sonner";

type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

interface CompanyProfileFormProps {
  initialData: {
    name: string;
    website: string;
    logo: string;
  };
}
interface FormInputProps {
  name: string;
  label: string;
  control: Control<any>;
  placeholder?: string;
  className?: string;
}
const CompanyProfileForm = ({ initialData }: CompanyProfileFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: initialData.name,
      website: initialData.website,
      logo: initialData.logo,
    },
  });

  const onSubmit = async (data: CompanyProfileFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
        const request = await updateCompanyProfile({
          name: data.name,
          website: data.website,
          logo: data.logo,
        });
        if (request.success) {
          toast.success("Company profile updated successfully");
        } else {
          toast.error("Failed to update company profile");
        }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update company profile."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const RenderFormField: React.FC<FormInputProps> = ({
    name,
    label,
    control,
    placeholder,
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

  return (
    <>
      {error && (
        <Alert variant={"destructive"}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <RenderFormField name="name" label="Company Name" control={form.control} placeholder="Enter company name" />
                <RenderFormField name="website" label="Website" control={form.control} placeholder="Enter website link" />
                <RenderFormField name="logo" label="Logo" control={form.control} placeholder="Enter logo link" />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export default CompanyProfileForm;
