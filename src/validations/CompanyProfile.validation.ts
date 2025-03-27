import { z } from "zod";

const companyProfileSchema = z.object({
  name: z.string().min(1, "Company name is required").max(100),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  logo: z.string().optional().or(z.literal("")),
});


export default companyProfileSchema;