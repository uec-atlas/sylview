import { EducationDataManager } from "#server/utils/EducationDataManager";

export default defineEventHandler(async (event) => {
  const lectureId = getRouterParam(event, "lectureId");
  if (!lectureId) throw createError({ statusCode: 400, statusMessage: "Missing lectureId" });

  const manager = EducationDataManager.getInstance();
  await manager.ensureLoaded();

  const lecture = manager.getLecture(`uar:education/${lectureId}`);
  if (!lecture) throw createError({ statusCode: 404, statusMessage: "Lecture not found" });

  const prerequisites = lecture.courses.flatMap((course) => course.prerequisites);

  return {
    ...lecture.toJSON(),
    instructors: lecture.instructors.map((inst) => inst.toJSON()),
    prerequisites: prerequisites.map((prereq) => {
      return {
        ...prereq.toJSON(),
        category: prereq.category?.toJSON(),
        checkpoint: prereq.checkpoint?.toJSON(),
        course: prereq.course?.toJSON(),
      };
    }),
  };
});
