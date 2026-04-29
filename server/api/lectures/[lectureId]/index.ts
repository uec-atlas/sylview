import { EducationDataManager } from "#server/utils/EducationDataManager";

export default defineEventHandler(async (event) => {
  const lectureId = getRouterParam(event, "lectureId");
  if (!lectureId) throw createError({ statusCode: 400, statusMessage: "Missing lectureId" });

  const manager = EducationDataManager.getInstance();
  await manager.ensureLoaded();

  const lecture = manager.getLecture(`uar:education/${lectureId}`);
  if (!lecture) throw createError({ statusCode: 404, statusMessage: "Lecture not found" });

  return {
    ...lecture.toJSON(),
    instructors: lecture.instructors.map((inst) => inst.toJSON()),
  };
});
