import * as R from "remeda";
import { EducationDataManager } from "#server/utils/EducationDataManager";

export default defineEventHandler(async (event) => {
  const checkpointId = getRouterParam(event, "checkpointId");
  if (!checkpointId) throw createError({ statusCode: 400, statusMessage: "Missing checkpointId" });

  const manager = EducationDataManager.getInstance();
  await manager.ensureLoaded();

  const checkpoint =
    manager.getMergedCheckpoints()?.get(`uar:education/${checkpointId}`) ||
    manager.getCheckpoints()?.get(`uar:education/${checkpointId}`);
  if (!checkpoint) throw createError({ statusCode: 404, statusMessage: "Checkpoint not found" });

  return {
    ...checkpoint.toJSON(),
    targetOrganizationName: checkpoint.targetOrganization
      ? formatOrganizationName(checkpoint.targetOrganization)
      : undefined,
    courseRequirements: checkpoint.courseRequirements
      .map((course) => ({
        id: course.id,
        name: course.name,
        credits: course.numberOfCredits,
      }))
      .sort(compareByName),
    categoryRequirements: checkpoint.categoryRequirements.map((req) => ({
      minCredits: req.minCredits,
      description: req.description,
      targetCategories: Array.from(req.targetCategories).map((cat) => ({
        id: cat.id,
        name: formatCategoryName(cat),
        targetCourses: R.pipe(
          manager.getCoursesInCategory(checkpoint.year || 0, checkpoint.targetOrganization, cat),
          R.uniqueBy(R.prop("name", "ja")),
          R.flatMap((c) => {
            const courses = [
              {
                id: c.id,
                name: c.name,
                credits: c.numberOfCredits,
              },
            ];
            if (c.succeededBy) {
              courses.push({
                id: c.succeededBy.id,
                name: c.succeededBy.name,
                credits: c.succeededBy.numberOfCredits,
              });
            }
            return courses;
          }),
          R.sort(compareByName),
        ),
      })),
    })),
  };
});
