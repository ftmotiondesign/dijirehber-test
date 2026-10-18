CREATE TABLE `stay_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`bucket` integer NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stays` (
	`room` text PRIMARY KEY NOT NULL,
	`id` text NOT NULL,
	`code_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL
);
