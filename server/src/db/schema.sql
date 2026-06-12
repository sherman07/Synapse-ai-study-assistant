CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(80) PRIMARY KEY,
  auth_provider VARCHAR(60) NOT NULL,
  auth_subject VARCHAR(191) NOT NULL,
  email VARCHAR(255) NULL,
  display_name VARCHAR(255) NULL,
  auth_mode VARCHAR(80) NULL,
  role VARCHAR(80) NOT NULL DEFAULT 'student',
  stripe_customer_id VARCHAR(255) NULL,
  stripe_subscription_id VARCHAR(255) NULL,
  plan VARCHAR(80) NOT NULL DEFAULT 'free',
  subscription_status VARCHAR(80) NOT NULL DEFAULT 'inactive',
  current_period_end DATETIME(3) NULL,
  metadata_json JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_users_provider_subject (auth_provider, auth_subject),
  KEY idx_users_email (email),
  KEY idx_users_stripe_customer (stripe_customer_id),
  KEY idx_users_stripe_subscription (stripe_subscription_id),
  KEY idx_users_plan_status (plan, subscription_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS generated_contents (
  id VARCHAR(96) PRIMARY KEY,
  user_id VARCHAR(80) NOT NULL,
  source_fingerprint VARCHAR(191) NOT NULL,
  client_fingerprint VARCHAR(191) NULL,
  title VARCHAR(500) NULL,
  summary LONGTEXT NOT NULL,
  language VARCHAR(80) NULL,
  detail_level VARCHAR(80) NULL,
  prompt_mode VARCHAR(120) NULL,
  source_count INT NOT NULL DEFAULT 0,
  cached TINYINT(1) NOT NULL DEFAULT 0,
  sections_json JSON NULL,
  connections_json JSON NULL,
  mind_map_json JSON NULL,
  visual_gallery_json JSON NULL,
  sources_json JSON NULL,
  full_result_json JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_generated_user_fingerprint (user_id, source_fingerprint),
  KEY idx_generated_user_updated (user_id, updated_at),
  KEY idx_generated_fingerprint (source_fingerprint),
  CONSTRAINT fk_generated_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS study_rooms (
  id VARCHAR(96) PRIMARY KEY,
  owner_user_id VARCHAR(80) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  visibility ENUM('private', 'shared', 'public') NOT NULL DEFAULT 'private',
  settings_json JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  KEY idx_study_rooms_owner_updated (owner_user_id, updated_at),
  CONSTRAINT fk_study_rooms_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS study_room_members (
  study_room_id VARCHAR(96) NOT NULL,
  user_id VARCHAR(80) NOT NULL,
  role ENUM('owner', 'editor', 'viewer') NOT NULL DEFAULT 'viewer',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (study_room_id, user_id),
  KEY idx_study_room_members_user (user_id),
  CONSTRAINT fk_study_room_members_room FOREIGN KEY (study_room_id) REFERENCES study_rooms(id) ON DELETE CASCADE,
  CONSTRAINT fk_study_room_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS focus_sessions (
  id VARCHAR(96) PRIMARY KEY,
  user_id VARCHAR(80) NOT NULL,
  study_room_id VARCHAR(96) NULL,
  generated_content_id VARCHAR(96) NULL,
  material_id VARCHAR(191) NULL,
  material_title VARCHAR(500) NULL,
  study_goal TEXT NULL,
  status ENUM('planned', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'completed',
  selected_scene VARCHAR(120) NULL,
  music_type VARCHAR(120) NULL,
  ambient_sound VARCHAR(120) NULL,
  pomodoro_minutes INT NULL,
  started_at DATETIME(3) NULL,
  ended_at DATETIME(3) NULL,
  total_focus_seconds INT NOT NULL DEFAULT 0,
  metrics_json JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  KEY idx_focus_sessions_user_updated (user_id, updated_at),
  KEY idx_focus_sessions_room (study_room_id),
  CONSTRAINT fk_focus_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_focus_sessions_room FOREIGN KEY (study_room_id) REFERENCES study_rooms(id) ON DELETE SET NULL,
  CONSTRAINT fk_focus_sessions_content FOREIGN KEY (generated_content_id) REFERENCES generated_contents(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS flashcard_decks (
  id VARCHAR(96) PRIMARY KEY,
  user_id VARCHAR(80) NOT NULL,
  generated_content_id VARCHAR(96) NULL,
  study_room_id VARCHAR(96) NULL,
  title VARCHAR(500) NOT NULL,
  language VARCHAR(80) NULL,
  settings_json JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  KEY idx_flashcard_decks_user_updated (user_id, updated_at),
  CONSTRAINT fk_flashcard_decks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_flashcard_decks_content FOREIGN KEY (generated_content_id) REFERENCES generated_contents(id) ON DELETE SET NULL,
  CONSTRAINT fk_flashcard_decks_room FOREIGN KEY (study_room_id) REFERENCES study_rooms(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS flashcards (
  id VARCHAR(96) PRIMARY KEY,
  deck_id VARCHAR(96) NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  hint TEXT NULL,
  source_reference TEXT NULL,
  difficulty ENUM('easy', 'medium', 'hard') NULL,
  tags_json JSON NULL,
  card_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  KEY idx_flashcards_deck_order (deck_id, card_order),
  CONSTRAINT fk_flashcards_deck FOREIGN KEY (deck_id) REFERENCES flashcard_decks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS progress_records (
  id VARCHAR(96) PRIMARY KEY,
  user_id VARCHAR(80) NOT NULL,
  study_room_id VARCHAR(96) NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(120) NOT NULL,
  metric_type VARCHAR(120) NOT NULL,
  score DECIMAL(8,3) NULL,
  status VARCHAR(80) NULL,
  payload_json JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  KEY idx_progress_user_updated (user_id, updated_at),
  KEY idx_progress_entity (entity_type, entity_id),
  CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_progress_room FOREIGN KEY (study_room_id) REFERENCES study_rooms(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
