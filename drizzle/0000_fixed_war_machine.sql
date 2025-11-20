CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type_id` text,
	`address` text,
	`user_id` text,
	`logo_url` text,
	`email` text,
	`phone` text,
	`location` text,
	`description` text,
	`website` text,
	`is_verified` integer DEFAULT false,
	`created_at` integer DEFAULT '"2025-10-20T15:17:48.882Z"',
	`company_type` text,
	FOREIGN KEY (`type_id`) REFERENCES `company_types`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `company_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `company_types_name_unique` ON `company_types` (`name`);--> statement-breakpoint
CREATE TABLE `item_category` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`type` text NOT NULL,
	`parent_id` text,
	FOREIGN KEY (`parent_id`) REFERENCES `item_category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`company_id` text,
	`user_id` text,
	`category_id` text,
	`price` real,
	`unit` text,
	`description` text,
	`image_urls` text,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `item_category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` text PRIMARY KEY NOT NULL,
	`city` text NOT NULL,
	`region` text
);
--> statement-breakpoint
CREATE TABLE `rfq` (
	`id` text PRIMARY KEY NOT NULL,
	`item_name` text NOT NULL,
	`company_id` text,
	`user_id` text,
	`quantity` integer,
	`unit` text,
	`description` text,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `units_name_unique` ON `units` (`name`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`full_name` text,
	`email` text,
	`phone` text,
	`company` text,
	`bio` text,
	`location` text,
	`profile_picture_url` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);