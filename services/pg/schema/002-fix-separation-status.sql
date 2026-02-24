ALTER TABLE separation_requests
  ADD COLUMN status_id integer REFERENCES status_codes (id)

