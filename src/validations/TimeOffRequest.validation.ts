import { z } from "zod";

const timeOffRequestSchema = z
  .object({
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z
      .date({
        required_error: "End date is required",
      })
      .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
        message: "End date must be today or in the future",
      }),
    type: z.enum(["VACATION", "SICK", "PERSONAL", "OTHER"]),
    reason: z.string().optional(),
    excludeWeekends: z.boolean().optional(),
    excludeHolidays: z.boolean().optional(),
    customExcludedDates: z.array(z.date()).default([]),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "Start date must be before end date",
    path: ["endDate"],
  });

export default timeOffRequestSchema;
