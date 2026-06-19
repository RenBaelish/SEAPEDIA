ALTER TABLE `addresses` ADD `recipient_name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `addresses` ADD `phone` text NOT NULL;--> statement-breakpoint
ALTER TABLE `addresses` ADD `street` text NOT NULL;--> statement-breakpoint
ALTER TABLE `addresses` ADD `city` text NOT NULL;--> statement-breakpoint
ALTER TABLE `addresses` ADD `province` text NOT NULL;--> statement-breakpoint
ALTER TABLE `addresses` ADD `postal_code` text NOT NULL;--> statement-breakpoint
ALTER TABLE `addresses` ADD `is_default` integer DEFAULT false NOT NULL;