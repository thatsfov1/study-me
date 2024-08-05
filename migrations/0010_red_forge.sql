ALTER TABLE "folders" RENAME TO "sessions";--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "folders_environment_id_environments_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_environment_id_environments_id_fk" FOREIGN KEY ("environment_id") REFERENCES "public"."environments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
