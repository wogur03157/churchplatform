CREATE TABLE `floatingMessageFormFields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`floatingMessageId` int NOT NULL,
	`fieldName` varchar(255) NOT NULL,
	`fieldType` enum('text','email','phone','select','textarea') NOT NULL,
	`fieldLabel` varchar(255) NOT NULL,
	`isRequired` int NOT NULL DEFAULT 1,
	`displayOrder` int NOT NULL,
	`selectOptions` text,
	`placeholder` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `floatingMessageFormFields_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `floatingMessageSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`floatingMessageId` int NOT NULL,
	`submissionData` text NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`ipAddress` varchar(45),
	CONSTRAINT `floatingMessageSubmissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `floatingMessageFormFields` ADD CONSTRAINT `floatingMessageFormFields_floatingMessageId_floatingMessages_id_fk` FOREIGN KEY (`floatingMessageId`) REFERENCES `floatingMessages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `floatingMessageSubmissions` ADD CONSTRAINT `floatingMessageSubmissions_floatingMessageId_floatingMessages_id_fk` FOREIGN KEY (`floatingMessageId`) REFERENCES `floatingMessages`(`id`) ON DELETE cascade ON UPDATE no action;