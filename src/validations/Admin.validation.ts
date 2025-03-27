import { z } from "zod";

const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(55),
  lastName: z.string().min(1, "Last name is required").max(55),
  email: z.string().email("Invalid email address").max(100),
  department: z.string().optional(),
  invitationCode: z
    .string()
    .length(6, "Invitation code must be 6 characters long"),
});

export default employeeSchema;
