import { z } from "zod";

const companyHolidaysSchema = z.object({
  name: z.string().min(1, "Holiday name is required"),
  date: z.string().min(1, "Date is required"),
  isRecurring: z.boolean().optional(),
});

export default companyHolidaysSchema;
