CREATE TABLE `sponsor_campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`profile_id` text NOT NULL,
	`title` text NOT NULL,
	`hotel_id` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`hotel_share_bps` integer NOT NULL,
	`hotel_cents` integer NOT NULL,
	`platform_cents` integer NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL,
	`payment_ref` text NOT NULL,
	`received_at` text NOT NULL,
	`created_by` text NOT NULL,
	`demo` integer NOT NULL,
	`payout_ref` text DEFAULT '' NOT NULL,
	`payout_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sponsor_campaigns_request_id_unique` ON `sponsor_campaigns` (`request_id`);--> statement-breakpoint
CREATE TABLE `sponsor_events` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`kind` text NOT NULL,
	`time` text NOT NULL
);
