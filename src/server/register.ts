import { createServerFn } from "@tanstack/react-start";
import { db } from "../db"; // Your drizzle db instance
import { registrations } from "../db/schema";
import { insertRegistrationSchema } from "./validation";

// Server function to save form data
export const createRegistration = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => insertRegistrationSchema.parse(data))
  .handler(async ({ data }) => {
    const [newRegistration] = await db
      .insert(registrations)
      .values(data)
      .returning();
    return newRegistration;
  });

// Server function to fetch all registrations
export const getRegistrations = createServerFn({ method: "GET" }).handler(
  async () => {
    return await db.select().from(registrations);
  },
);
