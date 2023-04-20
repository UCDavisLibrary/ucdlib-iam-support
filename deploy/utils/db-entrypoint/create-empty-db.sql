CREATE TABLE status_codes (
    id SERIAL PRIMARY KEY,
    name varchar(100) NOT NULL,
    request_type text[],
    description text,
    is_open boolean NOT NULL DEFAULT TRUE,
    archived boolean NOT NULL DEFAULT FALSE
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
    skip_supervisor boolean NOT NULL DEFAULT FALSE,
    is_existing_employee boolean NOT NULL DEFAULT FALSE,
    submitted_by varchar(100),
    submitted timestamp NOT NULL DEFAULT NOW(),
    modified_by varchar(100),
    modified timestamp NOT NULL DEFAULT NOW()
);
CREATE TABLE permissions_requests (
    id SERIAL PRIMARY KEY,
    onboarding_request_id integer REFERENCES onboarding_requests (id),
    permission_request_id integer,
    iam_id varchar(20),
    rt_ticket_id varchar(20),
    needs_supervisor_approval boolean NOT NULL DEFAULT FALSE,
    has_supervisor_approval boolean NOT NULL DEFAULT FALSE,
    revision integer NOT NULL DEFAULT 0, 
    permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
    notes text,
    submitted timestamp NOT NULL DEFAULT NOW(),
    submitted_by varchar(100)
);
CREATE TABLE separation_requests (
    id SERIAL PRIMARY KEY,
    iam_id varchar(20),
    rt_ticket_id varchar(20),
    separation_date timestamp,
    supervisor_id varchar(20),
    notes text,
    additional_data jsonb NOT NULL DEFAULT '{}'::jsonb,
    submitted timestamp NOT NULL DEFAULT NOW(),
    submitted_by varchar(100)
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
    title varchar(200),
    supervisor_id varchar(20),
    custom_supervisor boolean NOT NULL DEFAULT FALSE,
    types jsonb NOT NULL DEFAULT '{}'::jsonb,
    ucd_dept_code varchar(10),
    primary_association jsonb NOT NULL DEFAULT '{}'::jsonb,
    additional_data jsonb NOT NULL DEFAULT '{}'::jsonb,
    created timestamp DEFAULT NOW(),
    modified timestamp DEFAULT NOW()
);
CREATE TABLE group_types (
    id SERIAL PRIMARY KEY,
    name text,
    part_of_org boolean  NOT NULL DEFAULT FALSE,
    archived boolean NOT NULL DEFAULT FALSE
);
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    type integer NOT NULL REFERENCES group_types (id),
    name text,
    name_short varchar(40),
    parent_id integer REFERENCES groups (id),
    site_id integer,
    archived boolean NOT NULL DEFAULT FALSE
);
CREATE TABLE group_membership (
    id SERIAL PRIMARY KEY,
    employee_key integer REFERENCES employees (id),
    group_id integer REFERENCES groups (id),
    is_head boolean NOT NULL DEFAULT FALSE,
    UNIQUE (employee_key, group_id)
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
    created timestamp DEFAULT NOW(),
    UNIQUE (type, query)
);
CREATE TABLE outdated_records (
    id SERIAL PRIMARY KEY,
    reason varchar(100),
    iam_id varchar(20),
    fixed boolean NOT NULL DEFAULT FALSE,
    created timestamp DEFAULT NOW(),
    UNIQUE (reason, iam_id)
);

-- Request Statuses
--1
INSERT INTO "status_codes" ("name", "request_type", 'description')
VALUES ('Submitted', '{"onboarding", "separation"}', 'The request has been submitted and is awaiting processing.');
--2
INSERT INTO "status_codes" ("name", "request_type", 'description')
VALUES ('Awaiting Supervisor Response', '{"onboarding"}', "The employee's supervisor must fill out a permissions request form to proceed with the onboarding process.");
--3
INSERT INTO "status_codes" ("name", "request_type", 'description')
VALUES ('Awaiting UCD IAM Record', '{"onboarding"}', "The employee must have an active record in the UC Davis Identity and Access Management system.");
--4
INSERT INTO "status_codes" ("name", "request_type", 'description')
VALUES ('Awaiting User ID Provisioning', '{"onboarding"}', "The employee must have an active computing account in the UC Davis Identity and Access Management system.");
--5
INSERT INTO "status_codes" ("name", "request_type", 'description')
VALUES ('Provisioning Access', '{"onboarding"}', "Access to Library systems and services is being provisioned.");
--6
INSERT INTO "status_codes" ("name", "request_type", 'description')
VALUES ('Resolving', '{"onboarding", "separation"}', "The RT ticket associated with this request was recently set as 'Resolved'.");
--7
INSERT INTO "status_codes" ("name", "request_type", "is_open", 'description')
VALUES ('Resolved', '{"onboarding", "separation"}', FALSE, "This request has been resolved. You may comment on the associated RT ticket to reopen.");
--8
INSERT INTO "status_codes" ("name", "request_type", 'description')
VALUES ('Awaiting Supervisor Response', '{"permissions"}', "The employee's supervisor must approve the request.");

-- Group Types
INSERT INTO "group_types" ("name", "part_of_org")
VALUES ('Department', '1');
INSERT INTO "group_types" ("name", "part_of_org")
VALUES ('Council', '0');
