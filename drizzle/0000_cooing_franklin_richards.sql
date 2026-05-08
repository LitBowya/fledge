CREATE TABLE "registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sex" varchar(10) NOT NULL,
	"contact" varchar(20) NOT NULL,
	"is_attending" boolean DEFAULT true NOT NULL,
	"denomination" text NOT NULL,
	"location" text NOT NULL,
	"referral_source" text NOT NULL,
	"expectations" text,
	"wants_bus_return_trip" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
