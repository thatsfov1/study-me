DROP TABLE "files";--> statement-breakpoint
ALTER TABLE "sessions" RENAME TO "environments";--> statement-breakpoint
ALTER TABLE "collaborators" RENAME COLUMN "session_id" TO "environment_id";--> statement-breakpoint
ALTER TABLE "folders" RENAME COLUMN "session_id" TO "environment_id";--> statement-breakpoint
ALTER TABLE "environments" RENAME COLUMN "session_owner" TO "environment_owner";--> statement-breakpoint
ALTER TABLE "collaborators" DROP CONSTRAINT "collaborators_session_id_sessions_id_fk";
--> statement-breakpoint
ALTER TABLE "folders" DROP CONSTRAINT "folders_session_id_sessions_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_environment_id_environments_id_fk" FOREIGN KEY ("environment_id") REFERENCES "public"."environments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "folders" ADD CONSTRAINT "folders_environment_id_environments_id_fk" FOREIGN KEY ("environment_id") REFERENCES "public"."environments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
