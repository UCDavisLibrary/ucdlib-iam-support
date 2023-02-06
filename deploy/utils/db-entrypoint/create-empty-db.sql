CREATE TABLE status_codes (
    id SERIAL PRIMARY KEY,
    name varchar(100),
    archived boolean
);
CREATE TABLE onboarding_requests (
    id SERIAL PRIMARY KEY,
    iam_id varchar(20),
    rt_ticket_id varchar(20),
    start_date timestamp,
    status_id integer REFERENCES status_codes (id),
    library_title text,
    group_ids integer[],
    supervisor_id varchar(20),
    notes text,
    additional_data jsonb NOT NULL DEFAULT '{}'::jsonb,
    skip_supervisor boolean,
    submitted_by varchar(20),
    submitted timestamp NOT NULL DEFAULT NOW(),
    modified_by varchar(20),
    modified timestamp NOT NULL DEFAULT NOW()
);
CREATE TABLE onboarding_supervisor_responses (
    id SERIAL PRIMARY KEY,
    request_id integer REFERENCES onboarding_requests (id),
    permissions jsonb,
    notes text,
    submitted timestamp DEFAULT NOW(),
    submitted_by varchar(20)
);
CREATE TABLE separation_requests (
    id SERIAL PRIMARY KEY,
    iam_id varchar(20),
    rt_ticket_id varchar(20),
    separation_date timestamp,
    supervisor_id varchar(20),
    notes text,
    additional_data jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    iam_id varchar(20) UNIQUE,
    employee_id varchar(20) UNIQUE,
    user_id varchar(50) UNIQUE,
    email varchar(100),
    first_name text,
    last_name text,
    middle_name text,
    suffix text,
    supervisor_id varchar(20),
    is_faculty boolean,
    ucd_dept_code varchar(10),
    primary_association jsonb NOT NULL DEFAULT '{}'::jsonb,
    additional_data jsonb NOT NULL DEFAULT '{}'::jsonb,
    created timestamp DEFAULT NOW(),
    modified timestamp DEFAULT NOW()
);
CREATE TABLE group_types (
    id SERIAL PRIMARY KEY,
    name text,
    part_of_org boolean,
    archived boolean
);
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    type integer REFERENCES group_types (id),
    name text,
    parent_id integer REFERENCES groups (id),
    site_id integer,
    archived boolean
);
CREATE TABLE group_membership (
    id SERIAL PRIMARY KEY,
    employee_id integer REFERENCES employees (id),
    group_id integer REFERENCES groups (id)
);
CREATE TABLE config (
    id SERIAL PRIMARY KEY,
    meta_key varchar(50) unique NOT NULL,
    meta_value text NOT NULL,
    created timestamp DEFAULT NOW(),
    modified timestamp DEFAULT NOW()
);
CREATE TABLE cache (
    id SERIAL PRIMARY KEY,
    type varchar(100),
    query text NOT NULL,
    data jsonb,
    created timestamp DEFAULT NOW()
);