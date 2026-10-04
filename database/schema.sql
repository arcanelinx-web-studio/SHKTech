PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT '',
  product_condition TEXT NOT NULL DEFAULT '',
  quantity TEXT NOT NULL DEFAULT '',
  quantity_unit TEXT NOT NULL DEFAULT '',
  usage_application TEXT NOT NULL DEFAULT '',
  brand TEXT NOT NULL DEFAULT '',
  specification TEXT NOT NULL DEFAULT '',
  machine_type TEXT NOT NULL DEFAULT '',
  machine_model TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL,
  preferred TEXT NOT NULL DEFAULT '',
  selected_items TEXT NOT NULL DEFAULT '[]',
  source_page TEXT NOT NULL DEFAULT '',
  source_channel TEXT NOT NULL DEFAULT 'Website',
  stage TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'normal',
  owner TEXT NOT NULL DEFAULT '',
  next_follow_up TEXT NOT NULL DEFAULT '',
  internal_notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS enquiry_activity (
  id TEXT PRIMARY KEY,
  enquiry_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  activity_type TEXT NOT NULL DEFAULT 'note',
  note TEXT NOT NULL,
  FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_enquiries_stage ON enquiries(stage);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_enquiries_follow_up ON enquiries(next_follow_up);
CREATE INDEX IF NOT EXISTS idx_activity_enquiry ON enquiry_activity(enquiry_id, created_at);
