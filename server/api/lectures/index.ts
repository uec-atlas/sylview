import { EducationDataManager } from "#server/utils/EducationDataManager";

export default defineEventHandler(async () => {
  const manager = EducationDataManager.getInstance();
  await manager.ensureLoaded();
  const lectures = manager.getLectures();
  return Array.from(lectures?.values() ?? []).map((lecture) => ({
    ...lecture.toJSON(),
    instructors: lecture.instructors.map((inst) => inst.toJSON()),
  }));
});
