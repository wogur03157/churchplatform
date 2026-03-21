-- MySQL dump 10.13  Distrib 9.6.0, for macos14.8 (arm64)
--
-- Host: localhost    Database: churchplatform
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '1bf06e3a-1859-11f1-98aa-b28ca9aa59bf:1-1197';

--
-- Table structure for table `admin_permissions`
--

DROP TABLE IF EXISTS `admin_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `adminId` int NOT NULL COMMENT 'users.id (church_admin role)',
  `permKey` varchar(100) NOT NULL COMMENT 'announcements|images|videos|video_categories|floating_messages|popups|layout_settings|page_groups|form_config|form_submissions',
  `status` enum('allowed','denied') NOT NULL DEFAULT 'allowed',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_permissions` (`adminId`,`permKey`),
  CONSTRAINT `fk_ap_adminId` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_permissions`
--

LOCK TABLES `admin_permissions` WRITE;
/*!40000 ALTER TABLE `admin_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `churchId` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `authorId` int NOT NULL,
  `status` enum('published','draft') NOT NULL DEFAULT 'draft',
  `publishedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_announcements_churchId` (`churchId`),
  CONSTRAINT `fk_ann_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
INSERT INTO `announcements` VALUES (1,1,'환영합니다','<p>영신교회 홈페이지에 오신 것을 환영합니다.</p>',30,'published','2026-03-18 18:36:29','2026-03-18 08:51:05','2026-03-20 08:30:30'),(2,1,'주일예배 안내','<p>매주 일요일 오전 11시 본당에서 예배드립니다.</p>',30,'published','2026-03-18 08:51:05','2026-03-18 08:51:05','2026-03-20 08:30:30'),(3,NULL,'주차 안내','<p>조금 멀지만 대고 걸어와주세요</p>',30,'published','2026-03-18 18:36:19','2026-03-18 18:36:18','2026-03-18 18:36:18');
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `church_admins`
--

DROP TABLE IF EXISTS `church_admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `church_admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `churchId` int NOT NULL,
  `userId` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_church_admins` (`churchId`,`userId`),
  KEY `fk_ca_userId` (`userId`),
  CONSTRAINT `fk_ca_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ca_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `church_admins`
--

LOCK TABLES `church_admins` WRITE;
/*!40000 ALTER TABLE `church_admins` DISABLE KEYS */;
/*!40000 ALTER TABLE `church_admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `church_features`
--

DROP TABLE IF EXISTS `church_features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `church_features` (
  `id` int NOT NULL AUTO_INCREMENT,
  `churchId` int NOT NULL,
  `featureKey` varchar(100) NOT NULL COMMENT 'announcements|images|videos|video_categories|floating_messages|popups|layout_settings|page_groups|form_config|form_submissions|ai_assistant',
  `status` enum('enabled','disabled') NOT NULL DEFAULT 'enabled',
  `updatedBy` int DEFAULT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_church_features` (`churchId`,`featureKey`),
  CONSTRAINT `fk_cf_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `church_features`
--

LOCK TABLES `church_features` WRITE;
/*!40000 ALTER TABLE `church_features` DISABLE KEYS */;
INSERT INTO `church_features` VALUES (1,1,'announcements','enabled',NULL,'2026-03-18 08:51:05'),(2,1,'images','enabled',NULL,'2026-03-18 08:51:05'),(3,1,'videos','enabled',NULL,'2026-03-18 08:51:05'),(4,1,'floating_messages','enabled',NULL,'2026-03-18 08:51:05'),(5,1,'layout_settings','enabled',NULL,'2026-03-18 08:51:05'),(6,1,'ai_assistant','disabled',NULL,'2026-03-18 08:51:05');
/*!40000 ALTER TABLE `church_features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `churches`
--

DROP TABLE IF EXISTS `churches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `churches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `status` enum('pending','active','suspended','rejected') NOT NULL DEFAULT 'pending',
  `description` text,
  `logoUrl` varchar(512) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(320) DEFAULT NULL,
  `customDomain` varchar(255) DEFAULT NULL,
  `appliedBy` int DEFAULT NULL,
  `approvedBy` int DEFAULT NULL,
  `approvedAt` timestamp NULL DEFAULT NULL,
  `rejectedReason` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_churches_slug` (`slug`),
  KEY `fk_churches_appliedBy` (`appliedBy`),
  KEY `fk_churches_approvedBy` (`approvedBy`),
  CONSTRAINT `fk_churches_appliedBy` FOREIGN KEY (`appliedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_churches_approvedBy` FOREIGN KEY (`approvedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `churches`
--

LOCK TABLES `churches` WRITE;
/*!40000 ALTER TABLE `churches` DISABLE KEYS */;
INSERT INTO `churches` VALUES (1,'영신교회','youngshin','active',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-18 08:51:05',NULL,'2026-03-18 08:51:05','2026-03-18 08:51:05');
/*!40000 ALTER TABLE `churches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `floating_messages`
--

DROP TABLE IF EXISTS `floating_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `floating_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `churchId` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `messageType` enum('info','warning','success','announcement') NOT NULL DEFAULT 'info',
  `status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
  `startDate` timestamp NULL DEFAULT NULL,
  `endDate` timestamp NULL DEFAULT NULL,
  `displayPosition` enum('top','bottom','center') NOT NULL DEFAULT 'center',
  `createdBy` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fm_churchId` (`churchId`),
  CONSTRAINT `fk_fm_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `floating_messages`
--

LOCK TABLES `floating_messages` WRITE;
/*!40000 ALTER TABLE `floating_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `floating_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `form_fields`
--

DROP TABLE IF EXISTS `form_fields`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `form_fields` (
  `id` int NOT NULL AUTO_INCREMENT,
  `churchId` int DEFAULT NULL,
  `fieldType` varchar(50) NOT NULL COMMENT 'text|number|textarea|dropdown|checkbox|radio',
  `label` varchar(255) NOT NULL,
  `placeholder` varchar(255) DEFAULT NULL,
  `required` tinyint(1) NOT NULL DEFAULT '0',
  `options` json DEFAULT NULL COMMENT '드롭다운/체크박스 선택지 배열',
  `allowOther` enum('text','none') NOT NULL DEFAULT 'none',
  `displayOrder` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`),
  KEY `idx_ff_churchId` (`churchId`),
  CONSTRAINT `fk_ff_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `form_fields`
--

LOCK TABLES `form_fields` WRITE;
/*!40000 ALTER TABLE `form_fields` DISABLE KEYS */;
INSERT INTO `form_fields` VALUES (1,1,'text','이름','성함을 입력하세요',1,NULL,'none',1,'active'),(2,1,'number','연락처','010-0000-0000',1,NULL,'none',2,'active'),(3,1,'dropdown','방문목적','선택해주세요',1,'[\"예배 참석\", \"상담 요청\", \"친구 소개\"]','text',3,'active'),(4,1,'textarea','메시지','전달하실 내용 입력',0,NULL,'none',4,'inactive');
/*!40000 ALTER TABLE `form_fields` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `form_submissions`
--

DROP TABLE IF EXISTS `form_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `form_submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `churchId` int DEFAULT NULL,
  `fieldData` json NOT NULL COMMENT '{ "필드라벨": "값" } 형태',
  `submittedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fs_churchId` (`churchId`),
  CONSTRAINT `fk_fs_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `form_submissions`
--

LOCK TABLES `form_submissions` WRITE;
/*!40000 ALTER TABLE `form_submissions` DISABLE KEYS */;
INSERT INTO `form_submissions` VALUES (1,NULL,'{\"이름\": \"홍길동\", \"연락처\": \"01011111111\", \"방문목적\": \"예배 참석\"}','2026-03-18 09:19:20');
/*!40000 ALTER TABLE `form_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hero_slides`
--

DROP TABLE IF EXISTS `hero_slides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hero_slides` (
  `id` int NOT NULL AUTO_INCREMENT,
  `churchId` int DEFAULT NULL,
  `type` enum('text','image_split','image_bottom','image') NOT NULL DEFAULT 'text',
  `title` varchar(255) DEFAULT NULL,
  `subtitle` varchar(500) DEFAULT NULL,
  `imageUrl` text,
  `imageKey` varchar(500) DEFAULT NULL,
  `displayOrder` int NOT NULL DEFAULT '1',
  `status` enum('visible','hidden') NOT NULL DEFAULT 'visible',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hero_slides`
--

LOCK TABLES `hero_slides` WRITE;
/*!40000 ALTER TABLE `hero_slides` DISABLE KEYS */;
INSERT INTO `hero_slides` VALUES (1,1,'image_split','영신교회에 오신 여러분을 진심으로 환영합니다. ','우리 교회는 예수 그리스도의 복음을 쉬지 않고 전하며, 소그룹과 제자훈련을 통해 함께 예수님의 제자로 세워져가는 공동체입니다. 하나님을 사랑하고 사람을 사랑하는 삶으로 하나님께 기쁨이 되고, 이웃에게는 행복을 전하며 지역과 가정과 다음세대를 섬기는 데 힘쓰고 있습니다.','/uploads/layout-settings/1773950788488.jpeg','layout-settings/1773950788488.jpeg',1,'visible','2026-03-19 20:06:47','2026-03-20 08:31:03'),(2,1,'image','','','/uploads/layout-settings/1773983377099.png','layout-settings/1773983377099.png',1,'visible','2026-03-20 05:09:38','2026-03-20 08:31:03');
/*!40000 ALTER TABLE `hero_slides` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `images`
--

DROP TABLE IF EXISTS `images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `churchId` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `fileKey` varchar(512) NOT NULL,
  `url` varchar(1024) NOT NULL,
  `mimeType` varchar(100) DEFAULT NULL,
  `fileSize` int DEFAULT NULL,
  `uploadedBy` int NOT NULL,
  `status` enum('published','draft') NOT NULL DEFAULT 'draft',
  `displayOrder` int NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_images_churchId` (`churchId`),
  CONSTRAINT `fk_img_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `images`
--

LOCK TABLES `images` WRITE;
/*!40000 ALTER TABLE `images` DISABLE KEYS */;
INSERT INTO `images` VALUES (1,NULL,'단기선교','','images/30/UZ9Q6UCIeLBAPaKDOzt5v.jpeg','/uploads/images/30/UZ9Q6UCIeLBAPaKDOzt5v.jpeg','image/jpeg',8589575,30,'published',5,'2026-03-18 08:55:07','2026-03-18 18:18:29'),(2,NULL,'2025 단기선교','','images/30/3BXeYMZQwymow905KLxDZ.jpeg','/uploads/images/30/3BXeYMZQwymow905KLxDZ.jpeg','image/jpeg',8559780,30,'published',1,'2026-03-18 18:07:18','2026-03-18 18:18:04'),(3,NULL,'2025 단기선교','','images/30/i1zSTHJ9mCa2mK3YVLkc-.jpeg','/uploads/images/30/i1zSTHJ9mCa2mK3YVLkc-.jpeg','image/jpeg',187671,30,'published',-1,'2026-03-18 18:08:02','2026-03-18 18:18:41'),(4,NULL,'2026 겨울수련회 1일차','','images/30/v672I2rtNEpli8K-BzwDT.jpeg','/uploads/images/30/v672I2rtNEpli8K-BzwDT.jpeg','image/jpeg',2354794,30,'published',0,'2026-03-18 18:16:25','2026-03-18 18:16:25'),(5,NULL,'해피뉴이어','','images/30/nbFkqBjH0vc3q1D0YMz1N.jpeg','/uploads/images/30/nbFkqBjH0vc3q1D0YMz1N.jpeg','image/jpeg',1320480,30,'published',0,'2026-03-18 18:16:40','2026-03-18 18:16:40'),(6,NULL,'목사님 취향','','images/30/h-0AMmI-I_LDxsHTgHBtS.png','/uploads/images/30/h-0AMmI-I_LDxsHTgHBtS.png','image/png',6060725,30,'published',0,'2026-03-18 18:16:54','2026-03-18 18:16:54'),(7,NULL,'캐나다 특파원 파송','','images/30/vj48fV23DNpk1XJBRctDY.jpeg','/uploads/images/30/vj48fV23DNpk1XJBRctDY.jpeg','image/jpeg',2912198,30,'published',0,'2026-03-18 18:17:09','2026-03-18 18:17:09'),(8,NULL,'신입생환영회','','images/30/aW9nMWm5ELjsfEZWRLm4k.jpeg','/uploads/images/30/aW9nMWm5ELjsfEZWRLm4k.jpeg','image/jpeg',2364629,30,'published',0,'2026-03-18 18:31:38','2026-03-18 18:33:10');
/*!40000 ALTER TABLE `images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invitations`
--

DROP TABLE IF EXISTS `invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invitations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `churchId` int NOT NULL,
  `email` varchar(320) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expiresAt` timestamp NOT NULL,
  `usedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_invitations_token` (`token`),
  KEY `fk_inv_churchId` (`churchId`),
  CONSTRAINT `fk_inv_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invitations`
--

LOCK TABLES `invitations` WRITE;
/*!40000 ALTER TABLE `invitations` DISABLE KEYS */;
INSERT INTO `invitations` VALUES (3,7,'jhw607@naver.com','fa18a3c513b01732a9351ec8f2e661a2b0844516284135d1f0fe5b598a9ceb60','2026-03-24 05:29:26','2026-03-17 05:29:38','2026-03-17 05:29:26');
/*!40000 ALTER TABLE `invitations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `layout_settings`
--

DROP TABLE IF EXISTS `layout_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `layout_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `churchId` int DEFAULT NULL,
  `sectionType` varchar(50) NOT NULL COMMENT 'hero|announcements|images|videos|image_a|image_b',
  `status` enum('visible','hidden') NOT NULL DEFAULT 'visible',
  `displayOrder` int NOT NULL DEFAULT '0',
  `colSpan` int NOT NULL DEFAULT '1',
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text,
  `imageKey` varchar(512) DEFAULT NULL,
  `imageUrl` varchar(1024) DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_layout_settings` (`churchId`,`sectionType`),
  CONSTRAINT `fk_ls_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `layout_settings`
--

LOCK TABLES `layout_settings` WRITE;
/*!40000 ALTER TABLE `layout_settings` DISABLE KEYS */;
INSERT INTO `layout_settings` VALUES (1,1,'hero','visible',1,12,'영신교회에 오신 것을 환영합니다','하나님을 사랑하고 이웃을 사랑하는 행복한 공동체',NULL,NULL,30,'2026-03-18 18:42:28'),(2,1,'announcements','visible',4,12,'공지사항',NULL,NULL,NULL,30,'2026-03-19 19:01:06'),(3,1,'images','visible',5,12,'영신 갤러리',NULL,NULL,NULL,30,'2026-03-19 19:01:06'),(4,1,'videos','visible',2,6,'이번주 설교',NULL,NULL,NULL,30,'2026-03-19 19:01:06'),(5,1,'image_a','visible',3,6,NULL,NULL,'layout-settings/1773858480128.jpeg','/uploads/layout-settings/1773858480128.jpeg',30,'2026-03-18 18:42:28'),(6,1,'image_b','hidden',6,4,NULL,NULL,NULL,NULL,30,'2026-03-18 18:42:28');
/*!40000 ALTER TABLE `layout_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `page_groups`
--

DROP TABLE IF EXISTS `page_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `page_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `churchId` int DEFAULT NULL,
  `groupKey` varchar(100) NOT NULL COMMENT 'departments|god-love|neighbor-love',
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text,
  `content` longtext,
  `imageUrl` varchar(1024) DEFAULT NULL,
  `displayOrder` int NOT NULL DEFAULT '0',
  `status` enum('visible','hidden') NOT NULL DEFAULT 'visible',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_page_groups_slug` (`churchId`,`groupKey`,`slug`),
  KEY `idx_pg_churchId_groupKey` (`churchId`,`groupKey`),
  CONSTRAINT `fk_pg_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page_groups`
--

LOCK TABLES `page_groups` WRITE;
/*!40000 ALTER TABLE `page_groups` DISABLE KEYS */;
INSERT INTO `page_groups` VALUES (1,1,'departments','영아부','infant1','0 ~ 12개월 영아를 위한 부서입니다.',NULL,NULL,1,'visible','2026-03-18 08:51:05','2026-03-18 08:51:05'),(2,1,'departments','유아부','infant2','1세 ~ 4세 유아를 위한 부서입니다.',NULL,NULL,2,'visible','2026-03-18 08:51:05','2026-03-18 08:51:05'),(3,1,'departments','유치부','children1','5세 ~ 7세 미취학아동을 위한 부서입니다.',NULL,NULL,3,'visible','2026-03-18 08:51:05','2026-03-18 08:51:05'),(4,1,'departments','초등부','children2','초등학생을 위한 부서입니다.',NULL,NULL,4,'visible','2026-03-18 08:51:05','2026-03-18 08:51:05'),(5,1,'departments','청소년부','youth','중고등학생을 위한 부서입니다.',NULL,NULL,5,'visible','2026-03-18 08:51:05','2026-03-18 08:51:05'),(6,1,'departments','청년부','young-adult','청년들이 함께 모이는 부서입니다.',NULL,NULL,6,'visible','2026-03-18 08:51:05','2026-03-18 08:51:05'),(7,1,'god-love','새벽기도회','dawn-prayer','매일 새벽 5시 30분 예배당에서 진행됩니다.',NULL,NULL,1,'visible','2026-03-18 08:51:05','2026-03-18 08:51:05'),(8,1,'god-love','성경공부','bible-study','화요일 오전 10시, 깊은 말씀 공부.',NULL,NULL,2,'visible','2026-03-18 08:51:05','2026-03-18 08:51:05'),(9,1,'god-love','구역예배','cell-group','각 구역별로 모여 드리는 예배입니다.',NULL,NULL,3,'visible','2026-03-18 08:51:05','2026-03-18 08:51:05'),(10,1,'neighbor-love','지역사회봉사','community-service','우리 지역사회를 섬기는 봉사활동.',NULL,NULL,1,'visible','2026-03-18 08:51:05','2026-03-18 08:51:05'),(11,1,'neighbor-love','푸드뱅크','food-bank','어려운 이웃에게 식품을 나눕니다.',NULL,NULL,2,'visible','2026-03-18 08:51:05','2026-03-18 08:51:05');
/*!40000 ALTER TABLE `page_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `popups`
--

DROP TABLE IF EXISTS `popups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `popups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `churchId` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `imageKey` varchar(512) DEFAULT NULL,
  `imageUrl` varchar(1024) DEFAULT NULL,
  `linkUrl` varchar(1024) DEFAULT NULL,
  `startDate` timestamp NULL DEFAULT NULL,
  `endDate` timestamp NULL DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
  `createdBy` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_popups_churchId` (`churchId`),
  CONSTRAINT `fk_pop_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `popups`
--

LOCK TABLES `popups` WRITE;
/*!40000 ALTER TABLE `popups` DISABLE KEYS */;
/*!40000 ALTER TABLE `popups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_config`
--

DROP TABLE IF EXISTS `site_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `churchId` int DEFAULT NULL,
  `key` varchar(100) NOT NULL,
  `value` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_site_config` (`churchId`,`key`),
  CONSTRAINT `fk_sc_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_config`
--

LOCK TABLES `site_config` WRITE;
/*!40000 ALTER TABLE `site_config` DISABLE KEYS */;
INSERT INTO `site_config` VALUES (1,1,'church_name','영신교회','교회 이름'),(2,1,'map_address','서울특별시 양천구 목동로 19길 28','교회 주소'),(3,1,'map_embed_url','','카카오맵 임베드 URL (비어있으면 링크로 대체)'),(4,NULL,'hero_icon_1_url','/uploads/layout-settings/1773942762173.jpeg',NULL),(5,NULL,'church_logo_url','/uploads/layout-settings/1773941552034.png',NULL),(6,NULL,'hero_icon_1_url','/uploads/layout-settings/1773942362821.jpeg',NULL);
/*!40000 ALTER TABLE `site_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `openId` varchar(64) NOT NULL,
  `name` text,
  `email` varchar(320) DEFAULT NULL,
  `loginMethod` varchar(64) DEFAULT NULL,
  `role` enum('user','church_admin','super_admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_openId` (`openId`)
) ENGINE=InnoDB AUTO_INCREMENT=173 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (30,'100507398130019776410','장혜원','jhw607@gmail.com','google','super_admin','2026-03-12 09:20:41','2026-03-21 05:17:25','2026-03-21 05:17:25');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `video_categories`
--

DROP TABLE IF EXISTS `video_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `churchId` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `isBuiltIn` tinyint(1) NOT NULL DEFAULT '0',
  `displayOrder` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_video_categories_slug` (`churchId`,`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video_categories`
--

LOCK TABLES `video_categories` WRITE;
/*!40000 ALTER TABLE `video_categories` DISABLE KEYS */;
INSERT INTO `video_categories` VALUES (1,1,'주일예배','sunday',1,1),(2,1,'수요예배','wednesday',1,2),(3,1,'금요예배','friday',1,3),(4,1,'부활절','easter',0,4),(5,1,'성탄절','christmas',0,5);
/*!40000 ALTER TABLE `video_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `videos`
--

DROP TABLE IF EXISTS `videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `videos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `churchId` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `videoType` enum('upload','youtube','vimeo','url') NOT NULL DEFAULT 'youtube',
  `fileKey` varchar(512) DEFAULT NULL,
  `url` varchar(1024) NOT NULL,
  `thumbnailUrl` varchar(1024) DEFAULT NULL,
  `mimeType` varchar(100) DEFAULT NULL,
  `fileSize` int DEFAULT NULL,
  `duration` int DEFAULT NULL COMMENT '초 단위',
  `category` varchar(100) DEFAULT NULL COMMENT 'video_categories.slug',
  `uploadedBy` int NOT NULL,
  `status` enum('published','draft') NOT NULL DEFAULT 'draft',
  `displayOrder` int NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_videos_churchId` (`churchId`),
  KEY `idx_videos_category` (`category`),
  CONSTRAINT `fk_vid_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `videos`
--

LOCK TABLES `videos` WRITE;
/*!40000 ALTER TABLE `videos` DISABLE KEYS */;
INSERT INTO `videos` VALUES (1,NULL,'0315 주일','','youtube',NULL,'https://youtu.be/i5rGMB2YQHo?si=9fQxfcIzjyjVzFXg',NULL,NULL,NULL,NULL,NULL,30,'published',0,'2026-03-18 08:58:25','2026-03-20 08:33:20'),(2,NULL,'0308 주일','','youtube',NULL,'https://youtu.be/0kPKWEAowr0?si=uqlKx6RiceYmQf6k',NULL,NULL,NULL,NULL,NULL,30,'published',1,'2026-03-18 18:24:47','2026-03-20 08:33:28');
/*!40000 ALTER TABLE `videos` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-21 15:23:17
