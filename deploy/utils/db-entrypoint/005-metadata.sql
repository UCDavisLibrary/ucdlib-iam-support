CREATE TABLE metadata (
    metadata_id SERIAL PRIMARY KEY,
    metadata_key varchar(50) NOT NULL,
    metadata_value jsonb,
    employee_id integer REFERENCES employees (id)
);