CREATE TABLE `referral_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`status` text NOT NULL,
	`detail` text NOT NULL,
	`time` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `referral_leads` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`submission_id` text NOT NULL,
	`service_id` text NOT NULL,
	`service_title` text NOT NULL,
	`category` text NOT NULL,
	`hotel_id` text NOT NULL,
	`stay_id` text NOT NULL,
	`room` text NOT NULL,
	`guest_name` text NOT NULL,
	`phone` text NOT NULL,
	`service_at` text NOT NULL,
	`end_at` text DEFAULT '' NOT NULL,
	`persons` integer NOT NULL,
	`note` text NOT NULL,
	`consent_at` text NOT NULL,
	`status` text NOT NULL,
	`quote_cents` integer DEFAULT 0 NOT NULL,
	`actual_cents` integer DEFAULT 0 NOT NULL,
	`actual_units` integer DEFAULT 0 NOT NULL,
	`commission_mode` text NOT NULL,
	`commission_rate` integer NOT NULL,
	`hotel_share_bps` integer NOT NULL,
	`commission_cents` integer DEFAULT 0 NOT NULL,
	`hotel_cents` integer DEFAULT 0 NOT NULL,
	`platform_cents` integer DEFAULT 0 NOT NULL,
	`reply` text DEFAULT '' NOT NULL,
	`payment_ref` text DEFAULT '' NOT NULL,
	`demo` integer DEFAULT 1 NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`change_id` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `referral_leads_code_unique` ON `referral_leads` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `referral_leads_submission_id_unique` ON `referral_leads` (`submission_id`);