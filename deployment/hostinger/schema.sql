CREATE TABLE IF NOT EXISTS leads (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reference VARCHAR(64) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  stage VARCHAR(32) NOT NULL DEFAULT 'New',
  source VARCHAR(32) NOT NULL DEFAULT 'Website',
  type VARCHAR(80) NULL,
  name VARCHAR(120) NOT NULL,
  company VARCHAR(180) NULL,
  phone VARCHAR(50) NULL,
  email VARCHAR(190) NULL,
  location VARCHAR(180) NULL,
  product_condition VARCHAR(80) NULL,
  quantity VARCHAR(40) NULL,
  quantity_unit VARCHAR(40) NULL,
  usage_application VARCHAR(255) NULL,
  brand VARCHAR(160) NULL,
  specification VARCHAR(255) NULL,
  category VARCHAR(190) NULL,
  details TEXT NOT NULL,
  machine_type VARCHAR(160) NULL,
  machine_model VARCHAR(190) NULL,
  preferred VARCHAR(50) NULL,
  attachment_names_json LONGTEXT NOT NULL,
  items_json LONGTEXT NOT NULL,
  catalogue_json LONGTEXT NOT NULL,
  delivery_json LONGTEXT NOT NULL,
  notes TEXT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_leads_reference (reference),
  KEY idx_leads_created_at (created_at),
  KEY idx_leads_stage (stage),
  KEY idx_leads_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lead_activity (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  lead_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  detail TEXT NULL,
  PRIMARY KEY (id),
  KEY idx_activity_lead (lead_id, created_at),
  CONSTRAINT fk_activity_lead
    FOREIGN KEY (lead_id) REFERENCES leads(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
