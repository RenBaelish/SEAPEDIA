PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_promos` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text,
	`code` text NOT NULL,
	`discount_amount` integer NOT NULL,
	`type` text NOT NULL,
	`quota` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_promos`("id", "store_id", "code", "discount_amount", "type", "quota", "created_at") SELECT "id", "store_id", "code", "discount_amount", "type", "quota", "created_at" FROM `promos`;--> statement-breakpoint
DROP TABLE `promos`;--> statement-breakpoint
ALTER TABLE `__new_promos` RENAME TO `promos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `promos_code_unique` ON `promos` (`code`);