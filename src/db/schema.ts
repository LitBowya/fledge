import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sex: varchar("sex", { length: 10 }).notNull(), // e.g., Male, Female, Other
  contact: varchar("contact", { length: 20 }).notNull(),
  isAttending: boolean("is_attending").default(true).notNull(),
  denomination: text("denomination").notNull(),
  location: text("location").notNull(), // "Where you're coming from"
  referralSource: text("referral_source").notNull(), // "How you heard about Worship Unscripted"
  expectations: text("expectations"),
  wantsBusReturnTrip: boolean("wants_bus_return_trip").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
