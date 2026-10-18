CREATE TABLE `stay_events` (
	`id` text PRIMARY KEY NOT NULL,
	`stay_id` text NOT NULL,
	`room` text NOT NULL,
	`kind` text NOT NULL,
	`time` text NOT NULL
);
