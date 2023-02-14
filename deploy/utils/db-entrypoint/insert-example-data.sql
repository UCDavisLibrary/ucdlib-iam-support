-- Group Types
INSERT INTO "group_types" ("name", "part_of_org")
VALUES ('Department', '1');
INSERT INTO "group_types" ("name", "part_of_org")
VALUES ('Council', '0');

-- Groups
INSERT INTO "groups" ("type", "name")
VALUES ('1', 'Online Strategy');
INSERT INTO "groups" ("type", "name", "parent_id")
VALUES ('1', 'Digital Applications', '1');
INSERT INTO "groups" ("type", "name", "name_short", "parent_id")
VALUES ('1', 'IT Infrastructure Services', 'ITIS' , '1');
INSERT INTO "groups" ("type", "name")
VALUES ('2', 'Executive Council');
INSERT INTO "groups" ("type", "name")
VALUES ('2', 'Management Council');

-- Request Statuses
INSERT INTO "status_codes" ("name", "request_type")
VALUES ('Submitted', '{"onboarding", "separation"}');