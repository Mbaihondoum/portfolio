CREATE TYPE "public"."device_type" AS ENUM('mobile', 'tablet', 'desktop');--> statement-breakpoint
CREATE TYPE "public"."experience_type" AS ENUM('work', 'education');--> statement-breakpoint
CREATE TYPE "public"."image_kind" AS ENUM('screenshot', 'dashboard', 'chart');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('new', 'read', 'archived');--> statement-breakpoint
CREATE TYPE "public"."project_category" AS ENUM('web', 'mobile', 'data', 'fullstack');--> statement-breakpoint
CREATE TYPE "public"."publication_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."skill_category" AS ENUM('frontend', 'backend_db', 'mobile', 'data_bi', 'tools_devops');--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(254) NOT NULL,
	"subject" varchar(160) NOT NULL,
	"message" text NOT NULL,
	"locale" varchar(2) DEFAULT 'fr' NOT NULL,
	"status" "message_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "experience_type" NOT NULL,
	"title" jsonb DEFAULT '{"fr":"","en":""}'::jsonb NOT NULL,
	"organization" varchar(160) NOT NULL,
	"location" varchar(120) DEFAULT '' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"description" jsonb DEFAULT '{"fr":"","en":""}'::jsonb NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"path" varchar(300) NOT NULL,
	"project_slug" varchar(120),
	"locale" varchar(2) NOT NULL,
	"country" varchar(2),
	"device" "device_type" NOT NULL,
	"referrer_host" varchar(200),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"url" text NOT NULL,
	"alt" jsonb DEFAULT '{"fr":"","en":""}'::jsonb NOT NULL,
	"kind" "image_kind" DEFAULT 'screenshot' NOT NULL,
	"width" integer DEFAULT 1600 NOT NULL,
	"height" integer DEFAULT 1000 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"value" integer NOT NULL,
	"prefix" varchar(8) DEFAULT '' NOT NULL,
	"suffix" varchar(8) DEFAULT '' NOT NULL,
	"label" jsonb DEFAULT '{"fr":"","en":""}'::jsonb NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"title" jsonb DEFAULT '{"fr":"","en":""}'::jsonb NOT NULL,
	"summary" jsonb DEFAULT '{"fr":"","en":""}'::jsonb NOT NULL,
	"problem" jsonb DEFAULT '{"fr":"","en":""}'::jsonb NOT NULL,
	"solution" jsonb DEFAULT '{"fr":"","en":""}'::jsonb NOT NULL,
	"role" jsonb DEFAULT '{"fr":"","en":""}'::jsonb NOT NULL,
	"description" jsonb DEFAULT '{"fr":"","en":""}'::jsonb NOT NULL,
	"category" "project_category" NOT NULL,
	"stack" text[] DEFAULT '{}'::text[] NOT NULL,
	"cover_image" text,
	"cover_alt" jsonb DEFAULT '{"fr":"","en":""}'::jsonb NOT NULL,
	"demo_url" text,
	"repo_url" text,
	"power_bi_embed_url" text,
	"architecture" jsonb,
	"charts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" varchar(128) NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limits_key_window_start_pk" PRIMARY KEY("key","window_start")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"full_name" varchar(120) NOT NULL,
	"initials" varchar(4) NOT NULL,
	"headline" jsonb DEFAULT '{"fr":"","en":""}'::jsonb NOT NULL,
	"tagline" jsonb DEFAULT '{"fr":"","en":""}'::jsonb NOT NULL,
	"bio" jsonb DEFAULT '{"fr":"","en":""}'::jsonb NOT NULL,
	"approach" jsonb DEFAULT '{"fr":"","en":""}'::jsonb NOT NULL,
	"location" varchar(120) DEFAULT '' NOT NULL,
	"availability" jsonb DEFAULT '{"fr":"","en":""}'::jsonb NOT NULL,
	"email" varchar(254) NOT NULL,
	"github_url" text,
	"linkedin_url" text,
	"whatsapp" varchar(32),
	"cv_url_fr" text,
	"cv_url_en" text,
	"key_figures" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(60) NOT NULL,
	"category" "skill_category" NOT NULL,
	"in_marquee" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_metrics" ADD CONSTRAINT "project_metrics_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_messages_status_created_idx" ON "contact_messages" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "page_views_created_idx" ON "page_views" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "page_views_project_idx" ON "page_views" USING btree ("project_slug");--> statement-breakpoint
CREATE INDEX "project_images_project_idx" ON "project_images" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_metrics_project_idx" ON "project_metrics" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "projects_status_position_idx" ON "projects" USING btree ("status","position");--> statement-breakpoint
CREATE INDEX "skills_category_position_idx" ON "skills" USING btree ("category","position");