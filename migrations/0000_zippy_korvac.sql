CREATE TABLE IF NOT EXISTS "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone,
	"session_owner" uuid NOT NULL,
	"title" uuid NOT NULL,
	"data" text,
	"in_trash" text
);
