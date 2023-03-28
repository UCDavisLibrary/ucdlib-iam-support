import groupMigration from "./lib/group-migration.js";
import personMigration from "./lib/person-migration.js";
import groups from "./data/groups.js";
import employees from "./data/employees.js";

// import groups if none exist
if ( await groupMigration.groupsExist() ) {
  console.log("Groups already exist. Skipping import");
  await groupMigration.setGroupsBySlug();
  await groupMigration.getAllGroups();
} else {
  console.log("Importing groups");
  await groupMigration.importGroups(groups);
  console.log("groups imported");
}

// import people
console.log("Importing people");
await personMigration.importPeople(employees);
console.log("people imported");

console.log("Done");
