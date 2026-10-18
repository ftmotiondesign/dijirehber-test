CREATE TABLE `feedback` (
	`stay_id` text PRIMARY KEY NOT NULL,
	`room` text NOT NULL,
	`rating` integer NOT NULL,
	`message` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `feedback_access` (
	`stay_id` text PRIMARY KEY NOT NULL,
	`room` text NOT NULL,
	`code_hash` text NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `requests` ADD `activity_id` text;--> statement-breakpoint
ALTER TABLE `requests` ADD `activity_title` text;--> statement-breakpoint
ALTER TABLE `requests` ADD `reservation_at` text;--> statement-breakpoint
ALTER TABLE `requests` ADD `guests` integer;--> statement-breakpoint
ALTER TABLE `stays` ADD `guest_name` text;