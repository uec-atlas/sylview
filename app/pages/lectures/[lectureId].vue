<script lang="ts" setup>
import * as R from "remeda";

const lectureId = useRoute().params.lectureId;
const { data: lectures } = await useEducationLecturesData();
const { data: curriculumEntries } = await useEducationCurriculumData();

const lecture = lectures.value.get(`uar:education/${lectureId}`);
if (!lecture) {
  throw createError({ statusCode: 404, statusMessage: "Lecture not found" });
}

definePageMeta({ layout: "app" });
useSeoMeta({ title: lecture.name.ja });

const courseIds = [...lecture.courses].map((c) => c.id);

const { data: displayRequirements } = await useAsyncData(
  `lecture:${lectureId}:displayRequirements`,
  async () => {
    const allEntries = [...curriculumEntries.value.values()];
    const targetYear = lecture.year;

    // --- 1. 判定用ヘルパー関数 ---

    // カテゴリの階層一致（自身または先祖に一致するものがあるか）
    const isMatchedCategory = (lectureCat: CourseCategory | null | undefined, requiredCat: CourseCategory) => {
      if (!lectureCat) return false;
      for (const a of ancestors(lectureCat, (c) => c.subCategoryOf)) {
        if (a.id === requiredCat.id) return true;
      }
      return false;
    };

    // 組織の階層一致（AがBの先祖、あるいはBがAの先祖か）
    const isRelatedOrg = (orgA: Organization | undefined, orgB: Organization | undefined): boolean => {
      if (!orgA || !orgB) return true;
      if (orgA.id === orgB.id) return true;

      const getAncestorIds = (org: Organization) => {
        const ids = new Set<string>();
        const stack = [org];
        while (stack.length > 0) {
          const current = stack.pop();
          if (!current || ids.has(current.id)) continue;
          ids.add(current.id);
          if (current.subOrganizationOf) stack.push(...current.subOrganizationOf);
        }
        return ids;
      };

      const ancestorsA = getAncestorIds(orgA);
      const ancestorsB = getAncestorIds(orgB);
      return ancestorsA.has(orgB.id) || ancestorsB.has(orgA.id);
    };

    // --- 2. データのフィルタリング ---

    // 講義が属するマッピング（分類）を取得
    const myCategoryMappings = allEntries.filter(
      (entry): entry is CourseCategoryMapping =>
        entry.type === "CourseCategoryMapping" &&
        entry.year === targetYear &&
        courseIds.some((id) => [...entry.courses].some((c) => c.id === id)),
    );

    // 講義が紐づく組織（小組織）を抽出
    const lectureOrgs = R.pipe(
      myCategoryMappings,
      R.map((m) => m.targetOrganization),
      R.filter((org): org is Organization => org !== undefined),
      R.uniqueBy((org) => org.id),
    );

    // --- 3. 表示用データの整形 ---

    const allCheckpoints = allEntries.filter(
      (entry): entry is Checkpoint => entry.type === "Checkpoint" && entry.year === targetYear,
    );

    const result = allCheckpoints.flatMap((checkpoint) => {
      const isDirectlyRequired = [...checkpoint.courseRequirements].some((c) => courseIds.includes(c.id));
      const relatedOrgs = lectureOrgs.filter((org) => isRelatedOrg(org, checkpoint.targetOrganization));
      const targetOrgs =
        relatedOrgs.length > 0 ? relatedOrgs : isDirectlyRequired ? [checkpoint.targetOrganization] : [];

      return targetOrgs.flatMap((org) => {
        if (!org) return [];

        const categoryDetails = checkpoint.categoryRequirements
          .filter((req) =>
            [...req.targetCategories].some((requiredCat) =>
              myCategoryMappings.some(
                (m) => m.targetOrganization?.id === org.id && isMatchedCategory(m.category, requiredCat),
              ),
            ),
          )
          .map((req) => {
            const coursesInCategory = R.pipe(
              allEntries,
              R.filter(
                (e): e is CourseCategoryMapping =>
                  e.type === "CourseCategoryMapping" &&
                  e.year === checkpoint.year &&
                  isRelatedOrg(e.targetOrganization, checkpoint.targetOrganization) &&
                  [...req.targetCategories].some((requiredCat) => isMatchedCategory(e.category, requiredCat)),
              ),
              R.flatMap((e) => [...e.courses]),
              R.uniqueBy((c) => c.id),
            );
            const totalCreditsInCategory = R.sumBy(coursesInCategory, (c) => c.numberOfCredits ?? 0);

            return {
              description: req.description,
              categories: [...req.targetCategories],
              minCredits: req.minCredits,
              totalCourseCount: coursesInCategory.length,
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
        const uniqueMappings = mappings.filter(
          (m): m is CourseCategoryMapping => !!m.category && !existingCategories.has(m.category.id),
        );
        if (uniqueMappings.length === 0) return [];

        return [
          {
            id: `${orgId}-category-only`,
            name: { ja: "科目分類", en: "Category" },
            organizationName: formatOrganizationName(org).join(" "),
            status: "選択" as const,
            isDirectlyRequired: false,
            categoryDetails: uniqueMappings.map((m) => {
              const coursesInCategory = R.pipe(
                allEntries,
                R.filter(
                  (e): e is CourseCategoryMapping =>
                    e.type === "CourseCategoryMapping" &&
                    e.year === lecture.year &&
                    e.targetOrganization?.id === org?.id &&
                    isMatchedCategory(e.category, m.category),
                ),
                R.flatMap((e) => [...e.courses]),
                R.uniqueBy((c) => c.id),
              );
              const totalCreditsInCategory = R.sumBy(coursesInCategory, (c) => c.numberOfCredits ?? 0);
              return {
                description: undefined,
                categories: [m.category],
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
  },
  { watch: [curriculumEntries] },
);

const groupedRequirements = computed(() =>
  R.pipe(
    displayRequirements.value || [],
    R.groupBy((req) => req.organizationName),
    R.entries(),
    R.map(([label, items]) => ({
      label: label || "その他",
      items: R.uniqueBy(items, (i) => i.name.ja),
    })),
  ),
);
</script>

<template>
  <UMain :ui="{ base: 'min-h-full' }">
    <UContainer :ui="{ base: 'flex flex-col gap-8 mb-4' }">
      <UPageHeader :title="lecture.name.ja" :description="lecture.name.ja !== lecture.name.en ? lecture.name.en : ''" />

      <UPageColumns>
        <UPageCard title="時間割コード" icon="mdi:code-tags">
          <div class="flex flex-col items-start gap-2">
            <span class="select-all">{{ lecture.timeTableCode }}</span>
            <UButton :to="lecture.sourceUrl" target="_blank" icon="mdi:open-in-new"> シラバス参照 </UButton>
          </div>
        </UPageCard>
        <UPageCard title="単位数" icon="mdi:school">{{ lecture.numberOfCredits }}単位</UPageCard>
        <UPageCard title="開講学期" icon="mdi:calendar-clock">
          {{ lecture.year }}年度 {{ lecture.term }}<br>
        </UPageCard>
      </UPageColumns>

      <UPageCard title="単位区分・進級審査" icon="mdi:book-open-variant">
        <div v-if="groupedRequirements.length === 0" class="text-sm text-muted py-4">
          表示可能な情報は見つかりませんでした。
        </div>

        <div v-else class="space-y-8">
          <UAccordion :items="groupedRequirements">
            <template #leading="{ item }">
              <div class="flex justify-between items-center">
                <UBadge
                  :color="item.items.some(req => req.status === '必修') ? 'error' : 'info'"
                  variant="subtle"
                  :ui="{ base: 'whitespace-nowrap'}"
                >
                  {{ item.items.some(req => req.status === '必修') ? '必修' : '選択' }}
                </UBadge>
              </div>
            </template>
            <template #body="{ item }">
              <div class="grid gap-3 sm:grid-cols-2">
                <UCard v-for="req in item.items" :key="req.id">
                  <template #header>
                    <div class="flex justify-between items-center">
                      <span class="font-semibold">{{ req.name.ja.split("-").pop()?.trim() }}</span>
                      <UBadge
                        v-if="req.status === '必修' || item.items.every(req => req.status !== '必修')"
                        :color="req.status === '必修' ? 'error' : 'info'"
                        variant="subtle"
                        :ui="{ base: 'whitespace-nowrap'}"
                        >{{ req.status }}</UBadge
                      >
                    </div>
                  </template>

                  <div v-if="req.isDirectlyRequired" class="mb-2">この審査の要件に含まれることが明記されています。</div>

                  <div v-else class="flex flex-col gap-8">
                    <div v-for="(detail, idx) in req.categoryDetails" :key="idx" class="flex flex-col gap-2">
                      <UBreadcrumb
                        v-for="cat in detail.categories"
                        :key="cat.id"
                        :items="formatCategoryName(cat).map(label => ({ label }))"
                        :ui="{ list: 'flex-wrap'}"
                      />
                      <p>
                        全{{ detail.totalCourseCount }}科目 {{ detail.totalCreditsInCategory }}単位
                        <span v-if="detail.minCredits">(うち{{ detail.minCredits }}単位必修)</span>
                      </p>
                      <p v-if="detail.description" class="text-sm text-muted align-middle">
                        <Icon name="mdi:information-outline" class="inline-block -mb-px" />
                        {{ detail.description }}
                      </p>
                    </div>
                  </div>
                </UCard>
              </div>
            </template>
          </UAccordion>
        </div>
      </UPageCard>
    </UContainer>
  </UMain>
</template>
