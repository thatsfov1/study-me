ALTER TABLE "files" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "folders" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "folders" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "created_at" SET NOT NULL;