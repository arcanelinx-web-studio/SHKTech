CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'Website',
  status TEXT NOT NULL DEFAULT 'New',
  priority TEXT NOT NULL DEFAULT 'Normal',
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT,
  location TEXT,
  enquiry_type TEXT,
  product_condition TEXT,
  quantity INTEGER,
  quantity_unit TEXT,
  usage_application TEXT,
  brand TEXT,
  specification TEXT,
  machine_type TEXT,
  machine_model TEXT,
  category TEXT,
  details TEXT NOT NULL,
  preferred_contact TEXT,
  selected_items TEXT NOT NULL DEFAULT '[]',
  whatsapp_message TEXT,
  follow_up_at TEXT,
  assigned_to TEXT,
  last_contact_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_enquiries_follow_up ON enquiries(follow_up_at);

CREATE TABLE IF NOT EXISTS enquiry_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  enquiry_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  kind TEXT NOT NULL,
  note TEXT NOT NULL,
  FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activity_enquiry ON enquiry_activity(enquiry_id, created_at);
