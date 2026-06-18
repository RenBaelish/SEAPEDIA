CREATE TABLE `promos` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`code` text NOT NULL,
	`discount_amount` integer NOT NULL,
	`type` text NOT NULL,
	`quota` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `promos_code_unique` ON `promos` (`code`);