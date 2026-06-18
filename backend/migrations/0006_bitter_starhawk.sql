CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
ALTER TABLE `products` ADD `category_id` text REFERENCES categories(id);--> statement-breakpoint
ALTER TABLE `products` ADD `slug` text NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `compare_price` integer;--> statement-breakpoint
ALTER TABLE `products` ADD `rating` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `sold` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `weight` integer DEFAULT 1000 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `status` text DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `images` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
ALTER TABLE `stores` ADD `slug` text NOT NULL;--> statement-breakpoint
ALTER TABLE `stores` ADD `status` text DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE `stores` ADD `rating` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `stores` ADD `total_sales` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `stores_slug_unique` ON `stores` (`slug`);