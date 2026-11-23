CREATE TABLE estimates (
  request_id TEXT PRIMARY KEY NOT NULL,
  submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  town TEXT NOT NULL,
  property_type TEXT NOT NULL,
  services TEXT NOT NULL,
  visit_preference TEXT NOT NULL,
  notes TEXT NOT NULL,
  palette TEXT NOT NULL,
  language TEXT NOT NULL
);
