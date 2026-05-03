import * as R from "remeda";
import { EducationDataManager } from "#server/utils/EducationDataManager";
import { compareCheckpointType } from "~~/shared/utils";

export default defineEventHandler(async () => {
  const manager = EducationDataManager.getInstance();
  await manager.ensureLoaded();
  const lectures = manager.getLectures();
  return R.pipe(
    Array.from(lectures?.values() ?? []),
    R.map((lecture) => ({
      ...lecture.toJSON(),
      instructors: lecture.instructors.map((inst) => inst.toJSON()),
    })),
  );
});
