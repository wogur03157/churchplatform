-- MySQL dump 10.13  Distrib 9.6.0, for macos14.8 (arm64)
--
-- Host: localhost    Database: churchPlatform
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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '1bf06e3a-1859-11f1-98aa-b28ca9aa59bf:1-2075';

--
-- Dumping data for table `media`
--
-- WHERE:  mediaType='video'

LOCK TABLES `media` WRITE;
/*!40000 ALTER TABLE `media` DISABLE KEYS */;
INSERT INTO `media` (`id`, `legacySource`, `legacyId`, `churchId`, `categoryId`, `title`, `description`, `mediaType`, `videoType`, `fileKey`, `url`, `thumbnailUrl`, `mimeType`, `fileSize`, `duration`, `uploadedBy`, `status`, `displayOrder`, `showOnHome`, `altText`, `createdAt`, `updatedAt`, `sermonDate`, `scripture`, `preacher`) VALUES (1,'videos',1,NULL,2,'실패를 딛고 전진하라','','video','youtube',NULL,'https://youtu.be/i5rGMB2YQHo?si=9fQxfcIzjyjVzFXg',NULL,NULL,NULL,NULL,30,'published',0,0,NULL,'2026-03-28 11:32:37.595000','2026-11-03 15:42:52.000000','2026-03-15',NULL,NULL);
INSERT INTO `media` (`id`, `legacySource`, `legacyId`, `churchId`, `categoryId`, `title`, `description`, `mediaType`, `videoType`, `fileKey`, `url`, `thumbnailUrl`, `mimeType`, `fileSize`, `duration`, `uploadedBy`, `status`, `displayOrder`, `showOnHome`, `altText`, `createdAt`, `updatedAt`, `sermonDate`, `scripture`, `preacher`) VALUES (2,'videos',2,NULL,2,'내게 있는 이 것','','video','youtube',NULL,'https://youtu.be/0kPKWEAowr0?si=uqlKx6RiceYmQf6k',NULL,NULL,NULL,NULL,30,'published',0,0,NULL,'2026-03-28 11:32:37.595000','2026-11-08 01:58:49.000000','2026-03-08',NULL,NULL);
INSERT INTO `media` (`id`, `legacySource`, `legacyId`, `churchId`, `categoryId`, `title`, `description`, `mediaType`, `videoType`, `fileKey`, `url`, `thumbnailUrl`, `mimeType`, `fileSize`, `duration`, `uploadedBy`, `status`, `displayOrder`, `showOnHome`, `altText`, `createdAt`, `updatedAt`, `sermonDate`, `scripture`, `preacher`) VALUES (12,NULL,NULL,NULL,2,'세상이 설명할 수 없는 공동체','','video','youtube',NULL,'https://youtu.be/qlouZzQLEPg?si=PNkkxyC75dUyX5Uj',NULL,NULL,NULL,NULL,30,'published',0,0,NULL,'2026-06-13 14:26:03.528118','2026-11-03 15:42:43.000000','2026-05-24',NULL,NULL);
INSERT INTO `media` (`id`, `legacySource`, `legacyId`, `churchId`, `categoryId`, `title`, `description`, `mediaType`, `videoType`, `fileKey`, `url`, `thumbnailUrl`, `mimeType`, `fileSize`, `duration`, `uploadedBy`, `status`, `displayOrder`, `showOnHome`, `altText`, `createdAt`, `updatedAt`, `sermonDate`, `scripture`, `preacher`) VALUES (13,NULL,NULL,NULL,2,'부끄러움을 이기는 능력','','video','youtube',NULL,'https://youtu.be/zYPlnX5VO4U?si=WJ6ignQjm1NaIuRp',NULL,NULL,NULL,NULL,30,'published',0,0,NULL,'2026-06-13 14:26:41.228232','2026-11-03 15:41:26.000000','2026-06-07','로마서 1:16-17',NULL);
INSERT INTO `media` (`id`, `legacySource`, `legacyId`, `churchId`, `categoryId`, `title`, `description`, `mediaType`, `videoType`, `fileKey`, `url`, `thumbnailUrl`, `mimeType`, `fileSize`, `duration`, `uploadedBy`, `status`, `displayOrder`, `showOnHome`, `altText`, `createdAt`, `updatedAt`, `sermonDate`, `scripture`, `preacher`) VALUES (14,NULL,NULL,NULL,4,'우리는 날마다 교회가 무엇인지 묻는다','','video','youtube',NULL,'https://youtu.be/2GZjCjs1eW0?si=CaKjXyTghnQvqKG4',NULL,NULL,NULL,NULL,30,'published',0,0,NULL,'2026-06-13 14:28:06.194550','2026-11-03 15:42:28.000000','2026-06-12','빌레몬서 1:1-3',NULL);
INSERT INTO `media` (`id`, `legacySource`, `legacyId`, `churchId`, `categoryId`, `title`, `description`, `mediaType`, `videoType`, `fileKey`, `url`, `thumbnailUrl`, `mimeType`, `fileSize`, `duration`, `uploadedBy`, `status`, `displayOrder`, `showOnHome`, `altText`, `createdAt`, `updatedAt`, `sermonDate`, `scripture`, `preacher`) VALUES (15,NULL,NULL,NULL,2,'사도신경(6) 나는 승천하시어 하나님 우편에 계신 예수를 믿습니다','','video','youtube',NULL,'https://www.youtube.com/watch?v=aXuAKun99SU','https://i.ytimg.com/vi/aXuAKun99SU/maxresdefault.jpg',NULL,NULL,NULL,30,'published',0,0,NULL,'2026-11-03 15:57:18.786614','2026-11-03 16:00:04.367874','2026-10-11','에베소서 1장 20-22절',NULL);
INSERT INTO `media` (`id`, `legacySource`, `legacyId`, `churchId`, `categoryId`, `title`, `description`, `mediaType`, `videoType`, `fileKey`, `url`, `thumbnailUrl`, `mimeType`, `fileSize`, `duration`, `uploadedBy`, `status`, `displayOrder`, `showOnHome`, `altText`, `createdAt`, `updatedAt`, `sermonDate`, `scripture`, `preacher`) VALUES (16,NULL,NULL,NULL,2,'사도신경(7) 나는 심판하러 오시는 예수를 믿습니다','','video','youtube',NULL,'https://www.youtube.com/watch?v=aPU90JbCtVo','https://i.ytimg.com/vi/aPU90JbCtVo/maxresdefault.jpg',NULL,NULL,NULL,30,'published',0,0,NULL,'2026-11-03 15:58:00.298540','2026-11-03 16:00:04.367874','2026-11-01','데살로니가전서 4장 15-18절',NULL);
INSERT INTO `media` (`id`, `legacySource`, `legacyId`, `churchId`, `categoryId`, `title`, `description`, `mediaType`, `videoType`, `fileKey`, `url`, `thumbnailUrl`, `mimeType`, `fileSize`, `duration`, `uploadedBy`, `status`, `displayOrder`, `showOnHome`, `altText`, `createdAt`, `updatedAt`, `sermonDate`, `scripture`, `preacher`) VALUES (17,NULL,NULL,NULL,3,'하나님이 주신 질서','','video','youtube',NULL,'https://youtu.be/Vm2kwATJUeY?si=ZezofV-Iqs7yHL8d','https://i.ytimg.com/vi/Vm2kwATJUeY/maxresdefault.jpg',NULL,NULL,NULL,173,'published',0,0,NULL,'2026-11-08 01:05:10.712781','2026-11-08 01:05:10.712781','2026-11-04','베드로전서 11장 2-16절','김호준 목사');
INSERT INTO `media` (`id`, `legacySource`, `legacyId`, `churchId`, `categoryId`, `title`, `description`, `mediaType`, `videoType`, `fileKey`, `url`, `thumbnailUrl`, `mimeType`, `fileSize`, `duration`, `uploadedBy`, `status`, `displayOrder`, `showOnHome`, `altText`, `createdAt`, `updatedAt`, `sermonDate`, `scripture`, `preacher`) VALUES (19,NULL,NULL,NULL,4,'지금 우리에게도 말씀하신다','','video','youtube',NULL,'https://youtu.be/Zto_TkCJXuw?si=iuSzNYh3UaU32wPq','https://i.ytimg.com/vi/Zto_TkCJXuw/maxresdefault.jpg',NULL,NULL,NULL,173,'published',0,0,NULL,'2026-11-08 01:06:02.199854','2026-11-08 01:07:52.000000','2026-11-06','요나 1장 1-3절','김상호 담임목사');
INSERT INTO `media` (`id`, `legacySource`, `legacyId`, `churchId`, `categoryId`, `title`, `description`, `mediaType`, `videoType`, `fileKey`, `url`, `thumbnailUrl`, `mimeType`, `fileSize`, `duration`, `uploadedBy`, `status`, `displayOrder`, `showOnHome`, `altText`, `createdAt`, `updatedAt`, `sermonDate`, `scripture`, `preacher`) VALUES (20,NULL,NULL,NULL,4,'가장 귀한 것을, 가장 담대하게','','video','youtube',NULL,'https://youtu.be/s8q6qYw0_b8?si=3A-CoydxK1O6Hgfe','https://i.ytimg.com/vi/s8q6qYw0_b8/maxresdefault.jpg',NULL,NULL,NULL,173,'published',0,0,NULL,'2026-11-08 01:06:21.361461','2026-11-08 01:07:48.000000','2026-10-30','골로새서 1장 24-29절','조은찬 목사');
INSERT INTO `media` (`id`, `legacySource`, `legacyId`, `churchId`, `categoryId`, `title`, `description`, `mediaType`, `videoType`, `fileKey`, `url`, `thumbnailUrl`, `mimeType`, `fileSize`, `duration`, `uploadedBy`, `status`, `displayOrder`, `showOnHome`, `altText`, `createdAt`, `updatedAt`, `sermonDate`, `scripture`, `preacher`) VALUES (21,NULL,NULL,NULL,3,'뜨겁게 사랑하라','','video','youtube',NULL,'https://youtu.be/h-7f8VFa0d0?si=Xy0T6-0MBP1y5t-M','https://i.ytimg.com/vi/h-7f8VFa0d0/maxresdefault.jpg',NULL,NULL,NULL,173,'published',0,0,NULL,'2026-11-09 18:47:00.584011','2026-11-09 18:47:00.584011','2026-10-28','베드로전서 4장 1-11절','조은찬 목사');
INSERT INTO `media` (`id`, `legacySource`, `legacyId`, `churchId`, `categoryId`, `title`, `description`, `mediaType`, `videoType`, `fileKey`, `url`, `thumbnailUrl`, `mimeType`, `fileSize`, `duration`, `uploadedBy`, `status`, `displayOrder`, `showOnHome`, `altText`, `createdAt`, `updatedAt`, `sermonDate`, `scripture`, `preacher`) VALUES (22,NULL,NULL,NULL,3,'하나님의 영광을 위하여','','video','youtube',NULL,'https://youtu.be/E9BlNXA04oo?si=maFWsh9nAQ6eCuwy','https://i.ytimg.com/vi/E9BlNXA04oo/maxresdefault.jpg',NULL,NULL,NULL,173,'published',0,0,NULL,'2026-11-09 18:47:41.669950','2026-11-09 18:49:40.000000','2026-10-21','고린도전서 10장 23절-11장1절','김호준 목사');
INSERT INTO `media` (`id`, `legacySource`, `legacyId`, `churchId`, `categoryId`, `title`, `description`, `mediaType`, `videoType`, `fileKey`, `url`, `thumbnailUrl`, `mimeType`, `fileSize`, `duration`, `uploadedBy`, `status`, `displayOrder`, `showOnHome`, `altText`, `createdAt`, `updatedAt`, `sermonDate`, `scripture`, `preacher`) VALUES (23,NULL,NULL,NULL,3,'선한 그리스도인','','video','youtube',NULL,'https://youtu.be/mbxUb2JcAlU?si=7NNsfgedfSTSYnX3','https://i.ytimg.com/vi/mbxUb2JcAlU/maxresdefault.jpg',NULL,NULL,NULL,173,'published',0,0,NULL,'2026-11-09 18:49:55.008233','2026-11-09 18:49:55.008233','2026-10-14','벧전 3:13-18','조은찬 목사');
INSERT INTO `media` (`id`, `legacySource`, `legacyId`, `churchId`, `categoryId`, `title`, `description`, `mediaType`, `videoType`, `fileKey`, `url`, `thumbnailUrl`, `mimeType`, `fileSize`, `duration`, `uploadedBy`, `status`, `displayOrder`, `showOnHome`, `altText`, `createdAt`, `updatedAt`, `sermonDate`, `scripture`, `preacher`) VALUES (24,NULL,NULL,NULL,3,'하나님의 시험','','video','youtube',NULL,'https://youtu.be/tSN_CT62L3Q?si=PQNt-bBuOqh80k1n','https://i.ytimg.com/vi/tSN_CT62L3Q/maxresdefault.jpg',NULL,NULL,NULL,173,'published',0,0,NULL,'2026-11-09 18:50:15.015096','2026-11-09 18:50:15.015096','2026-10-07','고린도전서 10장 1-13절','김호준 목사');
INSERT INTO `media` (`id`, `legacySource`, `legacyId`, `churchId`, `categoryId`, `title`, `description`, `mediaType`, `videoType`, `fileKey`, `url`, `thumbnailUrl`, `mimeType`, `fileSize`, `duration`, `uploadedBy`, `status`, `displayOrder`, `showOnHome`, `altText`, `createdAt`, `updatedAt`, `sermonDate`, `scripture`, `preacher`) VALUES (25,NULL,NULL,NULL,3,'교회, 살아있는 공동체','','video','youtube',NULL,'https://youtu.be/3fzXy4zG0Gw?si=p5nZGWTEsFbxSMOU','https://i.ytimg.com/vi/3fzXy4zG0Gw/maxresdefault.jpg',NULL,NULL,NULL,173,'published',0,0,NULL,'2026-11-09 18:53:02.778508','2026-11-09 18:53:02.778508','2026-09-30','베드로전서 2장 4-12절','조은찬 목사');
INSERT INTO `media` (`id`, `legacySource`, `legacyId`, `churchId`, `categoryId`, `title`, `description`, `mediaType`, `videoType`, `fileKey`, `url`, `thumbnailUrl`, `mimeType`, `fileSize`, `duration`, `uploadedBy`, `status`, `displayOrder`, `showOnHome`, `altText`, `createdAt`, `updatedAt`, `sermonDate`, `scripture`, `preacher`) VALUES (26,NULL,NULL,NULL,2,'인생은 만남으로 달라집니다','','video','youtube',NULL,'https://youtu.be/P7d5aBoinpM?si=Ko8asbGfncelRyoJ','https://i.ytimg.com/vi/P7d5aBoinpM/maxresdefault.jpg',NULL,NULL,NULL,173,'published',0,0,NULL,'2026-11-09 18:55:48.582834','2026-11-09 18:55:48.582834','2026-11-08','요한복음 4장 7-26절','김상호 담임목사');
/*!40000 ALTER TABLE `media` ENABLE KEYS */;
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

-- Dump completed on 2026-11-10 16:23:31
