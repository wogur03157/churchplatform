-- ============================================================
-- 시드 데이터 초기화 (전체 삭제)
-- ⚠️  users 테이블은 포함하지 않음 (Google 로그인 데이터 보존)
-- ⚠️  실행 후 seed.sql 다시 실행해야 기본 데이터 복구됨
--
-- 실행 방법:
--   터미널: mysql -u 유저명 -p 디비명 < z_docs/reset.sql
--   MySQL 접속 후: SOURCE /path/to/z_docs/reset.sql;
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE announcements;
TRUNCATE TABLE images;
TRUNCATE TABLE videos;
TRUNCATE TABLE layout_settings;
TRUNCATE TABLE video_categories;
TRUNCATE TABLE page_groups;
TRUNCATE TABLE form_fields;
TRUNCATE TABLE form_submissions;
TRUNCATE TABLE site_config;
TRUNCATE TABLE church_features;
TRUNCATE TABLE church_admins;
TRUNCATE TABLE floating_messages;
TRUNCATE TABLE popups;
DELETE FROM churches WHERE id = 1;

SET FOREIGN_KEY_CHECKS = 1;
