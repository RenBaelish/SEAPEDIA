ALTER TABLE `stores` ADD `logo_url` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `banner_url` text;--> statement-breakpoint
ALTER TABLE `users` ADD `profile_picture_url` text DEFAULT 'https://i.pinimg.com/736x/22/87/85/2287856db3ec37b4d0d3fd0ffd99930a.jpg' NOT NULL;