CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_user_id` text NOT NULL,
	`img` text,
	`title` text,
	`launch_date` text,
	`description` text,
	`url` text,
	`repository` text,
	`publish` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`project_user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `setting` (
	`id` integer NOT NULL,
	`css` text,
	`cover_img` text,
	`open_label` text,
	`contact_message` text,
	`contact_label` text,
	`contact_email` text,
	FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `theme` (
	`name` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`disp_order` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`register_flg` integer DEFAULT false NOT NULL,
	`avatar_url` text,
	`link` text,
	`github` text,
	`instagram` text,
	`twitter` text,
	`title` text,
	`name` text,
	`subtitle` text,
	`img` text,
	`paragraph_one` text,
	`paragraph_two` text,
	`paragraph_three` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_user_id_unique` ON `users` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `users` (`user_id`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);
--> statement-breakpoint
INSERT INTO theme (`name`, `value`, `disp_order`) VALUES
('ocean', 'css%2Fblue.css', 1),
('sunset', 'css%2Forange.css', 2),
('forest', 'css%2Fgreen.css', 3),
('round earth', 'css%2Fround-earth.css', 4),
('round brown', 'css%2Fround-brown.css', 5);
