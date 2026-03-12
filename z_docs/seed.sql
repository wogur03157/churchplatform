-- ============================================================
-- 시드 데이터 (개발/테스트용)
-- INSERT IGNORE 사용 → 이미 존재하는 row는 건너뜀
--
-- 실행 방법:
--   터미널: mysql -u churchuser -pchurchpassword churchplatform < z_docs/seed.sql
--   MySQL 접속 후: SOURCE /path/to/z_docs/seed.sql;
--
-- 실행 순서:
--   1. 이 파일 전체 실행 (교회 + 기본 데이터 생성)
--   2. Google 로그인 → users 테이블에 자동 생성됨
--   3. 로그인 후 아래 쿼리로 어드민 연결:
--        INSERT INTO church_admins (churchId, userId)
--        SELECT 1, id FROM users WHERE openId = '본인_구글_openId';
--      그리고 슈퍼어드민으로 지정:
--        UPDATE users SET role = 'super_admin' WHERE openId = '본인_구글_openId';
-- ============================================================

-- ─── churches ────────────────────────────────────────────────────────────────

INSERT IGNORE INTO churches (id, name, slug, status, email, phone, address, appliedBy, approvedBy, approvedAt)
VALUES (1, '영신교회', 'youngshin', 'active', NULL, NULL, NULL, NULL, NULL, NOW());

SET @churchId = 1;

-- ─── layout_settings ─────────────────────────────────────────────────────────

INSERT IGNORE INTO layout_settings
  (sectionType, status, displayOrder, colSpan, title, subtitle, imageKey, imageUrl, churchId, updatedBy)
VALUES
  ('hero',          'visible', 1, 3, '영신교회에 오신 것을 환영합니다', '하나님을 사랑하고 이웃을 사랑하는 행복한 공동체', NULL, NULL, @churchId, NULL),
  ('announcements', 'visible', 2, 3, '교회 소식',   NULL, NULL, NULL, @churchId, NULL),
  ('images',        'visible', 3, 3, '교회 갤러리', NULL, NULL, NULL, @churchId, NULL),
  ('videos',        'visible', 4, 3, '최신 설교',   NULL, NULL, NULL, @churchId, NULL),
  ('image_a',       'hidden',  5, 1, NULL,          NULL, NULL, NULL, @churchId, NULL),
  ('image_b',       'hidden',  6, 1, NULL,          NULL, NULL, NULL, @churchId, NULL);

-- ─── video_categories ────────────────────────────────────────────────────────

INSERT IGNORE INTO video_categories (name, slug, isBuiltIn, displayOrder, churchId)
VALUES
  ('주일예배', 'sunday',    1, 1, @churchId),
  ('수요예배', 'wednesday', 1, 2, @churchId),
  ('금요예배', 'friday',    1, 3, @churchId),
  ('부활절',   'easter',    0, 4, @churchId),
  ('성탄절',   'christmas', 0, 5, @churchId);

-- ─── page_groups (부서) ───────────────────────────────────────────────────────

INSERT IGNORE INTO page_groups (groupKey, name, slug, description, content, imageUrl, displayOrder, status, churchId)
VALUES
  ('departments',   '유아부',       'infant',           '0~36개월 영아 및 유아를 위한 부서입니다.', NULL, NULL, 1, 'visible', @churchId),
  ('departments',   '아동부',       'children',         '초등학생을 위한 부서입니다.',               NULL, NULL, 2, 'visible', @churchId),
  ('departments',   '청소년부',     'youth',            '중고등학생을 위한 부서입니다.',             NULL, NULL, 3, 'visible', @churchId),
  ('departments',   '청년부',       'young-adult',      '청년들이 함께 모이는 부서입니다.',          NULL, NULL, 4, 'visible', @churchId),
  ('god-love',      '새벽기도회',   'dawn-prayer',      '매일 새벽 5시 30분 예배당에서 진행됩니다.', NULL, NULL, 1, 'visible', @churchId),
  ('god-love',      '성경공부',     'bible-study',      '화요일 오전 10시, 깊은 말씀 공부.',         NULL, NULL, 2, 'visible', @churchId),
  ('god-love',      '구역예배',     'cell-group',       '각 구역별로 모여 드리는 예배입니다.',        NULL, NULL, 3, 'visible', @churchId),
  ('neighbor-love', '지역사회봉사', 'community-service','우리 지역사회를 섬기는 봉사활동.',           NULL, NULL, 1, 'visible', @churchId),
  ('neighbor-love', '푸드뱅크',     'food-bank',        '어려운 이웃에게 식품을 나눕니다.',          NULL, NULL, 2, 'visible', @churchId);

-- ─── form_fields ─────────────────────────────────────────────────────────────

INSERT IGNORE INTO form_fields (fieldType, label, placeholder, required, options, allowOther, displayOrder, status, churchId)
VALUES
  ('text',     '이름',     '성함을 입력하세요',   1, NULL,                                              'none', 1, 'active',   @churchId),
  ('number',   '연락처',   '010-0000-0000',      1, NULL,                                              'none', 2, 'active',   @churchId),
  ('dropdown', '방문목적', '선택해주세요',        1, '["예배 참석","상담 요청","친구 소개"]',            'text', 3, 'active',   @churchId),
  ('textarea', '메시지',   '전달하실 내용 입력',  0, NULL,                                              'none', 4, 'inactive', @churchId);

-- ─── site_config ─────────────────────────────────────────────────────────────

INSERT IGNORE INTO site_config (churchId, `key`, value, description)
VALUES
  (@churchId, 'church_name',   '영신교회',                         '교회 이름'),
  (@churchId, 'map_address',   '서울특별시 양천구 목동로 19길 28', '교회 주소'),
  (@churchId, 'map_embed_url', '',                                 '카카오맵 임베드 URL (비어있으면 링크로 대체)');

-- ─── church_features ─────────────────────────────────────────────────────────

INSERT IGNORE INTO church_features (churchId, featureKey, status, updatedBy)
VALUES
  (@churchId, 'announcements',   'enabled',  NULL),
  (@churchId, 'images',          'enabled',  NULL),
  (@churchId, 'videos',          'enabled',  NULL),
  (@churchId, 'floating_messages','enabled', NULL),
  (@churchId, 'layout_settings', 'enabled',  NULL),
  (@churchId, 'ai_assistant',    'disabled', NULL);

-- ─── announcements ───────────────────────────────────────────────────────────

INSERT IGNORE INTO announcements (title, content, authorId, churchId, status, publishedAt)
VALUES
  ('환영합니다', '<p>영신교회 홈페이지에 오신 것을 환영합니다.</p>', NULL, @churchId, 'published', NOW()),
  ('주일예배 안내', '<p>매주 일요일 오전 11시 본당에서 예배드립니다.</p>', NULL, @churchId, 'published', NOW());
