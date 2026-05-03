import * as R from "remeda";
import { EducationDataManager } from "#server/utils/EducationDataManager";
import { descendantsDFS } from "~~/shared/utils";

const educationalOrganizationTypes = [
  "School",
  "Cluster",
  "EducationProgram",
  "GraduateSchool",
  "Department",
  "EducationCourse",
];

export default defineEventHandler(async () => {
  const manager = EducationDataManager.getInstance();
  await manager.ensureLoaded();
  const organizations = R.pipe(
    Array.from(manager.getOrganizations()?.values() ?? []),
    R.filter((org) => !!org.type && educationalOrganizationTypes.includes(org.type)),
    R.map((org) => ({
      ...org.toJSON(),
      ancestors: Array.from(ancestors(org, (item) => item.subOrganizationOf?.[0])).map((ancestor) => ({
        type: ancestor.type,
        id: ancestor.id,
        name: ancestor.name,
      })),
      descendants: Array.from(descendantsDFS(org, (item) => item.hasSubOrganization)).map((descendant) => ({
        type: descendant.type,
        id: descendant.id,
        name: descendant.name,
      })),
    })),
  );
  return organizations;
});
