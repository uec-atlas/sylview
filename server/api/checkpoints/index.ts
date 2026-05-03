import * as R from "remeda";
import { EducationDataManager } from "#server/utils/EducationDataManager";
import { compareCheckpointType } from "~~/shared/utils";

export default defineEventHandler(async () => {
  const manager = EducationDataManager.getInstance();
  await manager.ensureLoaded();
  const checkpoints = manager.getMergedCheckpoints();
  return R.pipe(
    Array.from(checkpoints?.values() ?? []),
    R.map((checkpoint) => ({
      ...checkpoint.toJSON(),
      targetOrganizationName: checkpoint.targetOrganization?.name,
    })),
    R.sort((a, b) => compareJaString(a.targetOrganizationName?.ja, b.targetOrganizationName?.ja)),
    R.sort(compareCheckpointType),
  );
});
