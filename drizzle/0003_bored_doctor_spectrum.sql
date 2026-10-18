ALTER TABLE `requests` ADD `requested_exit` text;--> statement-breakpoint
ALTER TABLE `requests` ADD `reply` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `requests` ADD `updated_at` text;