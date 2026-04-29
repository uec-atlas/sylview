import * as R from "remeda";
import { EducationDataManager } from "#server/utils/EducationDataManager";
import { compareJaString, formatOrganizationName } from "#shared/utils";

export default defineEventHandler(async (event) => {
  const lectureId = getRouterParam(event, "lectureId");
  if (!lectureId) throw createError({ statusCode: 400, statusMessage: "Missing lectureId" });

  const manager = EducationDataManager.getInstance();
  await manager.ensureLoaded();

  const lecture = manager.getLecture(`uar:education/${lectureId}`);
  if (!lecture) throw createError({ statusCode: 404, statusMessage: "Lecture not found" });

  const courseIds = [...lecture.courses].map((c) => c.id);
  const targetYear = lecture.year;
  const checkpoints = manager.getCheckpoints();
  const mappings = manager.getMappings();

  if (!checkpoints || !mappings) throw createError({ statusCode: 500, statusMessage: "Data not loaded" });

  // 講義が属するマッピング（分類）を取得
  const myCategoryMappings = [...mappings.values()].filter(
    (entry) => entry.year === targetYear && courseIds.some((id) => entry.courses.some((c) => c.id === id)),
  );

  const lectureOrgs = R.pipe(
    myCategoryMappings,
    R.map((m) => m.targetOrganization),
    R.filter((org) => org !== undefined),
    R.uniqueBy((org) => org.id),
  );

  const result = Array.from(checkpoints.values())
    .filter((cp) => cp.year === targetYear)
    .flatMap((checkpoint) => {
      const isDirectlyRequired = [...checkpoint.courseRequirements].some((c) => courseIds.includes(c.id));
      const relatedOrgs = lectureOrgs.filter((org) => manager.isRelatedOrg(org, checkpoint.targetOrganization));
      const targetOrgs =
        relatedOrgs.length > 0 ? relatedOrgs : isDirectlyRequired ? [checkpoint.targetOrganization] : [];

      return targetOrgs.flatMap((org) => {
        if (!org) return [];

        const categoryDetails = checkpoint.categoryRequirements
          .filter((req) =>
            [...req.targetCategories].some((requiredCat) =>
              myCategoryMappings.some(
                (m) => m.targetOrganization?.id === org.id && manager.isMatchedCategory(m.category, requiredCat),
              ),
            ),
          )
          .map((req) => {
            const allCoursesInCategory = R.pipe(
              [...req.targetCategories].flatMap((cat) => manager.getCoursesInCategory(checkpoint.year || 0, org, cat)),
              R.uniqueBy((c) => c.id),
            );
            const totalCreditsInCategory = R.sumBy(allCoursesInCategory, (c) => c.numberOfCredits ?? 0);

            return {
              description: req.description,
              categories: [...req.targetCategories].map((c) => ({ id: c.id, name: formatCategoryName(c) })),
              minCredits: req.minCredits,
              totalCourseCount: allCoursesInCategory.length,
              totalCreditsInCategory,
              isRequired: req.minCredits !== undefined && totalCreditsInCategory === req.minCredits,
            };
          });

        if (!isDirectlyRequired && categoryDetails.length === 0) return [];

        return [
          {
            id: `${org.id}-${checkpoint.id}`,
            name: checkpoint.name,
            organizationName: formatOrganizationName(org).join(" "),
            isDirectlyRequired,
            status: isDirectlyRequired || categoryDetails.some((d) => d.isRequired) ? "必修" : "選択",
            categoryDetails,
          },
        ];
      });
    });

  const categoryOnlyEntries = R.pipe(
    myCategoryMappings,
    R.filter((m) => m.targetOrganization !== undefined),
    R.groupBy((m) => m.targetOrganization?.id),
    R.entries(),
    R.flatMap(([orgId, mappings]) => {
      const org = mappings[0].targetOrganization;
      const existingCategories = new Set(
        result
          .filter((r) => r.organizationName === formatOrganizationName(org).join(" "))
          .flatMap((r) => r.categoryDetails.flatMap((d) => d.categories.map((c) => c.id))),
      );
      const uniqueMappings = mappings.filter((m) => !!m.category && !existingCategories.has(m.category.id));
      if (uniqueMappings.length === 0) return [];

      return [
        {
          id: `${orgId}-category-only`,
          name: { ja: "科目分類", en: "Category" },
          organizationName: formatOrganizationName(org).join(" "),
          status: "選択" as const,
          isDirectlyRequired: false,
          categoryDetails: uniqueMappings.map((m) => {
            const coursesInCategory = manager.getCoursesInCategory(lecture.year, org, m.category);
            const totalCreditsInCategory = R.sumBy(coursesInCategory, (c) => c.numberOfCredits ?? 0);
            return {
              description: undefined,
              categories: [{ id: m.category.id, name: formatCategoryName(m.category) }],
              minCredits: undefined,
              totalCourseCount: coursesInCategory.length,
              totalCreditsInCategory,
              isRequired: false,
            };
          }),
        },
      ];
    }),
  );

  return R.pipe(
    [...result, ...categoryOnlyEntries],
    R.sort((a, b) => {
      const checkpoints = ["2年次終了時審査", "卒業研究着手審査", "卒業所要単位"];
      return checkpoints.indexOf(a.name.ja) - checkpoints.indexOf(b.name.ja);
    }),
    R.sort((a, b) => compareJaString(a.organizationName, b.organizationName)),
  );
});
