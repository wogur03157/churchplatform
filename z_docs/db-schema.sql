-- ============================================================
-- 영신교회 플랫폼 DB 스키마
-- DB: MySQL 8.0+
-- 생성일: 2026-03-05
-- ============================================================

-- ─── users ───────────────────────────────────────────────────
CREATE TABLE `users` (
  `id`           INT          NOT NULL AUTO_INCREMENT,
  `openId`       VARCHAR(64)  NOT NULL,
  `name`         TEXT         NULL,
  `email`        VARCHAR(320) NULL,
  `loginMethod`  VARCHAR(64)  NULL,
  `role`         ENUM('user','church_admin','super_admin') NOT NULL DEFAULT 'user',
  `createdAt`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_openId` (`openId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── churches ────────────────────────────────────────────────
CREATE TABLE `churches` (
  `id`             INT          NOT NULL AUTO_INCREMENT,
  `name`           VARCHAR(255) NOT NULL,
  `slug`           VARCHAR(100) NOT NULL,
  `status`         ENUM('pending','active','suspended','rejected') NOT NULL DEFAULT 'pending',
  `description`    TEXT         NULL,
  `logoUrl`        VARCHAR(512) NULL,
  `address`        VARCHAR(255) NULL,
  `phone`          VARCHAR(50)  NULL,
  `email`          VARCHAR(320) NULL,
  `customDomain`   VARCHAR(255) NULL,
  `dbName`         VARCHAR(64)  NULL COMMENT '교회별 테넌트 DB 이름 (NULL이면 프로비저닝 전)',
  `appliedBy`      INT          NULL,
  `approvedBy`     INT          NULL,
  `approvedAt`     TIMESTAMP    NULL,
  `rejectedReason` TEXT         NULL,
  `createdAt`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_churches_slug` (`slug`),
  KEY `fk_churches_appliedBy` (`appliedBy`),
  KEY `fk_churches_approvedBy` (`approvedBy`),
  CONSTRAINT `fk_churches_appliedBy`  FOREIGN KEY (`appliedBy`)  REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_churches_approvedBy` FOREIGN KEY (`approvedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── church_admins ───────────────────────────────────────────
CREATE TABLE `church_admins` (
  `id`        INT       NOT NULL AUTO_INCREMENT,
  `churchId`  INT       NOT NULL,
  `userId`    INT       NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_church_admins` (`churchId`, `userId`),
  CONSTRAINT `fk_ca_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ca_userId`   FOREIGN KEY (`userId`)   REFERENCES `users`    (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── church_features ─────────────────────────────────────────
-- 교회 단위 기능 활성화 여부 (홈페이지 노출 + 관리자 메뉴 제공 범위)
CREATE TABLE `church_features` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `churchId`   INT          NOT NULL,
  `featureKey` VARCHAR(100) NOT NULL
    COMMENT 'announcements|images|videos|video_categories|floating_messages|popups|layout_settings|page_groups|form_config|form_submissions|ai_assistant',
  `status`     ENUM('enabled','disabled') NOT NULL DEFAULT 'enabled',
  `updatedBy`  INT          NULL,
  `updatedAt`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_church_features` (`churchId`, `featureKey`),
  CONSTRAINT `fk_cf_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── admin_permissions ───────────────────────────────────────
-- 관리자 개인 단위 메뉴 접근 권한 (기능 설정 ON인 것 안에서만 유효)
CREATE TABLE `admin_permissions` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `adminId`   INT          NOT NULL COMMENT 'users.id (church_admin role)',
  `churchId`  INT          NULL COMMENT '권한이 유효한 교회 — NULL은 전 교회 공통',
  `permKey`   VARCHAR(100) NOT NULL
    COMMENT 'announcements|images|videos|video_categories|floating_messages|popups|layout_settings|page_groups|form_config|form_submissions',
  `status`    ENUM('allowed','denied') NOT NULL DEFAULT 'allowed',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_permissions` (`adminId`, `permKey`, `churchId`),
  CONSTRAINT `fk_ap_adminId` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── announcements ───────────────────────────────────────────
CREATE TABLE `announcements` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `churchId`    INT          NULL,
  `title`       VARCHAR(255) NOT NULL,
  `content`     TEXT         NOT NULL,
  `authorId`    INT          NOT NULL,
  `status`      ENUM('published','draft') NOT NULL DEFAULT 'draft',
  `publishedAt` TIMESTAMP    NULL,
  `createdAt`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_announcements_churchId` (`churchId`),
  CONSTRAINT `fk_ann_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── images ──────────────────────────────────────────────────
CREATE TABLE `images` (
  `id`           INT           NOT NULL AUTO_INCREMENT,
  `churchId`     INT           NULL,
  `title`        VARCHAR(255)  NOT NULL,
  `description`  TEXT          NULL,
  `fileKey`      VARCHAR(512)  NOT NULL,
  `url`          VARCHAR(1024) NOT NULL,
  `mimeType`     VARCHAR(100)  NULL,
  `fileSize`     INT           NULL,
  `uploadedBy`   INT           NOT NULL,
  `status`       ENUM('published','draft') NOT NULL DEFAULT 'draft',
  `displayOrder` INT           NOT NULL DEFAULT 0,
  `createdAt`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_images_churchId` (`churchId`),
  CONSTRAINT `fk_img_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── video_categories ────────────────────────────────────────
CREATE TABLE `video_categories` (
  `id`           INT          NOT NULL AUTO_INCREMENT,
  `churchId`     INT          NULL,
  `name`         VARCHAR(100) NOT NULL,
  `slug`         VARCHAR(100) NOT NULL,
  `isBuiltIn`    TINYINT(1)   NOT NULL DEFAULT 0,
  `displayOrder` INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_video_categories_slug` (`churchId`, `slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── videos ──────────────────────────────────────────────────
CREATE TABLE `videos` (
  `id`           INT           NOT NULL AUTO_INCREMENT,
  `churchId`     INT           NULL,
  `title`        VARCHAR(255)  NOT NULL,
  `description`  TEXT          NULL,
  `videoType`    ENUM('upload','youtube','vimeo','url') NOT NULL DEFAULT 'youtube',
  `fileKey`      VARCHAR(512)  NULL,
  `url`          VARCHAR(1024) NOT NULL,
  `thumbnailUrl` VARCHAR(1024) NULL,
  `mimeType`     VARCHAR(100)  NULL,
  `fileSize`     INT           NULL,
  `duration`     INT           NULL COMMENT '초 단위',
  `category`     VARCHAR(100)  NULL COMMENT 'video_categories.slug',
  `uploadedBy`   INT           NOT NULL,
  `status`       ENUM('published','draft') NOT NULL DEFAULT 'draft',
  `displayOrder` INT           NOT NULL DEFAULT 0,
  `createdAt`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_videos_churchId`  (`churchId`),
  KEY `idx_videos_category`  (`category`),
  CONSTRAINT `fk_vid_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── floating_messages ───────────────────────────────────────
CREATE TABLE `floating_messages` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `churchId`        INT          NULL,
  `title`           VARCHAR(255) NOT NULL,
  `content`         TEXT         NOT NULL,
  `messageType`     ENUM('info','warning','success','announcement') NOT NULL DEFAULT 'info',
  `status`          ENUM('active','inactive') NOT NULL DEFAULT 'inactive',
  `startDate`       TIMESTAMP    NULL,
  `endDate`         TIMESTAMP    NULL,
  `displayPosition` ENUM('top','bottom','center') NOT NULL DEFAULT 'center',
  `createdBy`       INT          NOT NULL,
  `createdAt`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fm_churchId` (`churchId`),
  CONSTRAINT `fk_fm_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── popups ──────────────────────────────────────────────────
CREATE TABLE `popups` (
  `id`        INT           NOT NULL AUTO_INCREMENT,
  `churchId`  INT           NULL,
  `title`     VARCHAR(255)  NOT NULL,
  `imageKey`  VARCHAR(512)  NULL,
  `imageUrl`  VARCHAR(1024) NULL,
  `linkUrl`   VARCHAR(1024) NULL,
  `startDate` TIMESTAMP     NULL,
  `endDate`   TIMESTAMP     NULL,
  `status`    ENUM('active','inactive') NOT NULL DEFAULT 'inactive',
  `createdBy` INT           NOT NULL,
  `createdAt` TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_popups_churchId` (`churchId`),
  CONSTRAINT `fk_pop_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── layout_settings ─────────────────────────────────────────
CREATE TABLE `layout_settings` (
  `id`           INT           NOT NULL AUTO_INCREMENT,
  `churchId`     INT           NULL,
  `sectionType`  VARCHAR(50)   NOT NULL COMMENT 'hero|announcements|images|videos|image_a|image_b',
  `status`       ENUM('visible','hidden') NOT NULL DEFAULT 'visible',
  `displayOrder` INT           NOT NULL DEFAULT 0,
  `colSpan`      INT           NOT NULL DEFAULT 1,
  `title`        VARCHAR(255)  NULL,
  `subtitle`     TEXT          NULL,
  `imageKey`     VARCHAR(512)  NULL,
  `imageUrl`     VARCHAR(1024) NULL,
  `updatedBy`    INT           NULL,
  `updatedAt`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_layout_settings` (`churchId`, `sectionType`),
  CONSTRAINT `fk_ls_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── page_groups ─────────────────────────────────────────────
-- 부서, 경건생활, 이웃사랑 등 그룹 단위 페이지 관리
CREATE TABLE `page_groups` (
  `id`           INT           NOT NULL AUTO_INCREMENT,
  `churchId`     INT           NULL,
  `groupKey`     VARCHAR(100)  NOT NULL COMMENT 'departments|god-love|neighbor-love',
  `name`         VARCHAR(100)  NOT NULL,
  `slug`         VARCHAR(100)  NOT NULL,
  `description`  TEXT          NULL,
  `content`      LONGTEXT      NULL,
  `imageUrl`     VARCHAR(1024) NULL,
  `displayOrder` INT           NOT NULL DEFAULT 0,
  `status`       ENUM('visible','hidden') NOT NULL DEFAULT 'visible',
  `createdAt`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_page_groups_slug` (`churchId`, `groupKey`, `slug`),
  KEY `idx_pg_churchId_groupKey` (`churchId`, `groupKey`),
  CONSTRAINT `fk_pg_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── form_fields ─────────────────────────────────────────────
CREATE TABLE `form_fields` (
  `id`           INT          NOT NULL AUTO_INCREMENT,
  `churchId`     INT          NULL,
  `fieldType`    VARCHAR(50)  NOT NULL COMMENT 'text|number|textarea|dropdown|checkbox|radio',
  `label`        VARCHAR(255) NOT NULL,
  `placeholder`  VARCHAR(255) NULL,
  `required`     TINYINT(1)   NOT NULL DEFAULT 0,
  `options`      JSON         NULL COMMENT '드롭다운/체크박스 선택지 배열',
  `allowOther`   ENUM('text','none') NOT NULL DEFAULT 'none',
  `displayOrder` INT          NOT NULL DEFAULT 0,
  `status`       ENUM('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`),
  KEY `idx_ff_churchId` (`churchId`),
  CONSTRAINT `fk_ff_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── form_submissions ────────────────────────────────────────
CREATE TABLE `form_submissions` (
  `id`          INT       NOT NULL AUTO_INCREMENT,
  `churchId`    INT       NULL,
  `fieldData`   JSON      NOT NULL COMMENT '{ "필드라벨": "값" } 형태',
  `submittedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fs_churchId` (`churchId`),
  CONSTRAINT `fk_fs_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── site_config ─────────────────────────────────────────────
CREATE TABLE `site_config` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `churchId`    INT          NULL,
  `key`         VARCHAR(100) NOT NULL,
  `value`       TEXT         NOT NULL,
  `description` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_site_config` (`churchId`, `key`),
  CONSTRAINT `fk_sc_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── invitations ─────────────────────────────────────────────
CREATE TABLE `invitations` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `churchId`  INT          NOT NULL,
  `email`     VARCHAR(320) NOT NULL,
  `token`     VARCHAR(64)  NOT NULL,
  `expiresAt` TIMESTAMP    NOT NULL,
  `usedAt`    TIMESTAMP    NULL,
  `createdAt` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_invitations_token` (`token`),
  CONSTRAINT `fk_inv_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── hero_slides ─────────────────────────────────────────────
-- 홈화면 히어로 배너 슬라이드 (4가지 타입)
CREATE TABLE `hero_slides` (
  `id`           INT          NOT NULL AUTO_INCREMENT,
  `churchId`     INT          NULL,
  `type`         ENUM('text','image_split','image_bottom','image') NOT NULL DEFAULT 'text',
  `title`        VARCHAR(255) NULL,
  `subtitle`     VARCHAR(500) NULL,
  `imageUrl`     TEXT         NULL,
  `imageKey`     VARCHAR(500) NULL,
  `displayOrder` INT          NOT NULL DEFAULT 1,
  `status`       ENUM('visible','hidden') NOT NULL DEFAULT 'visible',
  `createdAt`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_hs_churchId` (`churchId`),
  CONSTRAINT `fk_hs_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 기본 데이터 (site_config, video_categories)
-- ============================================================

-- 기본 영상 카테고리 (isBuiltIn = 1 → 삭제 불가)
INSERT INTO `video_categories` (`churchId`, `name`, `slug`, `isBuiltIn`, `displayOrder`) VALUES
  (NULL, '주일예배', 'sunday',    1, 1),
  (NULL, '수요예배', 'wednesday', 1, 2),
  (NULL, '금요예배', 'friday',    1, 3);

-- 기본 사이트 설정 (교회별로 INSERT 시 churchId 지정)
-- INSERT INTO `site_config` (`churchId`, `key`, `value`, `description`) VALUES
--   (1, 'church_name',  '교회이름',  '교회 이름'),
--   (1, 'map_address',  '',          '교회 주소'),
--   (1, 'map_embed_url','',          '카카오맵 임베드 URL');
