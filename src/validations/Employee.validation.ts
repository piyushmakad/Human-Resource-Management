import { z } from "zod";

const adminSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(55),
  lastName: z.string().min(1, "Last name is required").max(55),
  email: z.string().email("Invalid email address").max(100),
  companyName: z.string().min(1, "Company name is required").max(100),
  companyWebsite: z
    .string()
    .url("Invalid website URL")
    .optional()
    .or(z.literal("")),
  companyLogo: z.string().url().optional().or(z.literal("")),
});
export default adminSchema;
