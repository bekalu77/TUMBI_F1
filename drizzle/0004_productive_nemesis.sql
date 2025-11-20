PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_companies` (
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
	`created_at` integer DEFAULT '"2025-11-03T18:14:12.490Z"',
	`company_type` text,
	FOREIGN KEY (`type_id`) REFERENCES `company_types`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_companies`("id", "name", "type_id", "address", "user_id", "logo_url", "email", "phone", "location", "description", "website", "is_verified", "created_at", "company_type") SELECT "id", "name", "type_id", "address", "user_id", "logo_url", "email", "phone", "location", "description", "website", "is_verified", "created_at", "company_type" FROM `companies`;--> statement-breakpoint
DROP TABLE `companies`;--> statement-breakpoint
ALTER TABLE `__new_companies` RENAME TO `companies`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`company_id` text,
	`user_id` text,
	`category_id` text,
	`price` real,
	`unit` text,
	`description` text,
	`image_urls` text,
	`created_at` integer DEFAULT '"2025-11-03T18:14:12.493Z"',
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `item_category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_items`("id", "name", "company_id", "user_id", "category_id", "price", "unit", "description", "image_urls", "created_at") SELECT "id", "name", "company_id", "user_id", "category_id", "price", "unit", "description", "image_urls", "created_at" FROM `items`;--> statement-breakpoint
DROP TABLE `items`;--> statement-breakpoint
ALTER TABLE `__new_items` RENAME TO `items`;--> statement-breakpoint
CREATE TABLE `__new_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`category` text,
	`description` text NOT NULL,
	`company_id` text,
	`user_id` text,
	`location` text,
	`salary` text,
	`type` text,
	`position` text,
	`experience` text,
	`required_skills` text,
	`qualifications` text,
	`how_to_apply` text,
	`additional_notes` text,
	`application_link` text,
	`deadline` integer,
	`created_at` integer DEFAULT '"2025-11-03T18:14:12.496Z"',
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_jobs`("id", "title", "category", "description", "company_id", "user_id", "location", "salary", "type", "position", "experience", "required_skills", "qualifications", "how_to_apply", "additional_notes", "application_link", "deadline", "created_at") SELECT "id", "title", "category", "description", "company_id", "user_id", "location", "salary", "type", "position", "experience", "required_skills", "qualifications", "how_to_apply", "additional_notes", "application_link", "deadline", "created_at" FROM `jobs`;--> statement-breakpoint
DROP TABLE `jobs`;--> statement-breakpoint
ALTER TABLE `__new_jobs` RENAME TO `jobs`;--> statement-breakpoint
ALTER TABLE `users` ADD `role` text;