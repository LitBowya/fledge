import { z } from "zod";

export const insertRegistrationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  sex: z.enum(["Male", "Female", "Other"]),
  contact: z.string().min(10, "Enter a valid contact"),
  isAttending: z.boolean().default(true),
  denomination: z.string().min(2, "Denomination is required"),
  location: z.string().min(2, "Location is required"),
  referralSource: z.string().min(2, "Please tell us how you heard about us"),
  expectations: z.string().optional(),
  wantsBusReturnTrip: z.boolean().default(false),
});

export type RegistrationInput = z.infer<typeof insertRegistrationSchema>;
