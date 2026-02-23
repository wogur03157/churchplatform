CREATE TABLE `formFields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`fieldName` varchar(255) NOT NULL,
	`fieldType` enum('text','email','phone','select','textarea') NOT NULL,
	`fieldLabel` varchar(255) NOT NULL,
	`isRequired` int NOT NULL DEFAULT 1,
	`displayOrder` int NOT NULL,
	`selectOptions` text,
	`placeholder` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `formFields_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`submissionData` text NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`ipAddress` varchar(45),
	CONSTRAINT `submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `floatingMessageFormFields`;--> statement-breakpoint
DROP TABLE `floatingMessageSubmissions`;--> statement-breakpoint
ALTER TABLE `formFields` ADD CONSTRAINT `formFields_messageId_floatingMessages_id_fk` FOREIGN KEY (`messageId`) REFERENCES `floatingMessages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_messageId_floatingMessages_id_fk` FOREIGN KEY (`messageId`) REFERENCES `floatingMessages`(`id`) ON DELETE cascade ON UPDATE no action;