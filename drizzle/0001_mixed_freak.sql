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
	`created_at` integer DEFAULT '"2025-10-21T09:05:07.642Z"',
	`company_type` text,
	FOREIGN KEY (`type_id`) REFERENCES `company_types`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_companies`("id", "name", "type_id", "address", "user_id", "logo_url", "email", "phone", "location", "description", "website", "is_verified", "created_at", "company_type") SELECT "id", "name", "type_id", "address", "user_id", "logo_url", "email", "phone", "location", "description", "website", "is_verified", "created_at", "company_type" FROM `companies`;--> statement-breakpoint
DROP TABLE `companies`;--> statement-breakpoint
ALTER TABLE `__new_companies` RENAME TO `companies`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `items` ADD `created_at` integer DEFAULT '"2025-10-21T09:05:07.643Z"';