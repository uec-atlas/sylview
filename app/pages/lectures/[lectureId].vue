<script lang="ts" setup>
import * as R from "remeda";

const lectureId = useRoute().params.lectureId;
const { data: _lecture } = await useFetch(`/api/lectures/${lectureId}`);
const lecture = _lecture.value;
if (!lecture) {
  throw createError({ statusCode: 404, statusMessage: "Lecture not found" });
}

const { data: requirements } = await useFetch(`/api/lectures/${lectureId}/requirements`);

const isFromLectureList = useState("isFromLectureList", () => false);
definePageMeta({
  layout: "app",
  middleware: (_to, from) => {
    if (from.path === "/lectures") {
      const isFromLectureList = useState("isFromLectureList", () => false);
      isFromLectureList.value = true;
    }
  },
});
useSeoMeta({ title: lecture.name.ja });

const router = useRouter();

const groupedRequirements = computed(() =>
  R.pipe(
    requirements.value || [],
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
      <UPageHeader :title="lecture.name.ja">
        <template #headline>
          <UButton
            @click="() => { isFromLectureList && router.back() }"
            :href="isFromLectureList ? undefined: '/lectures'"
            variant="link"
            icon="mdi:arrow-left"
            class="self-start px-0"
            >科目検索に戻る</UButton
          >
        </template>
        <template #description>
          <div class="flex flex-col gap-4">
            <p v-if="lecture.name.ja !== lecture.name.en" class="text-sm text-muted">
              {{ lecture.name.en }}
            </p>
            <div class="flex flex-row flex-wrap gap-2">
              <UButton :to="lecture.sourceUrl" target="_blank" icon="mdi:open-in-new">シラバス参照</UButton>
            </div>
          </div>
        </template>
      </UPageHeader>

      <div class="grid gap-4 md:grid-cols-2 items-stretch">
        <UPageCard title="開講学期・時限・対象学年" icon="mdi:calendar-clock" class="items-start">
          {{ lecture.year }}年度 {{ lecture.term }}
          {{ lecture.periods.join(", ") }}<br>
          {{ lecture.targetGrades?.map(g => `${g}年`).join(", ") }}
        </UPageCard>

        <UPageCard title="単位数" icon="mdi:school" class="items-start"> {{ lecture.numberOfCredits }}単位 </UPageCard>

        <UPageCard title="担当教員" icon="mdi:account-tie" class="items-start">
          <div v-if="lecture.instructors.length === 0" class="text-sm text-muted py-4">
            表示可能な情報は見つかりませんでした。
          </div>
          <div v-else class="flex flex-row flex-wrap gap-2">
            <UButton
              v-for="inst in lecture.instructors"
              :key="inst.id"
              variant="outline"
              :to="`/lectures/?q=${inst.name.ja || inst.name.en}`"
              >{{ inst.name?.ja }}</UButton
            >
          </div>
        </UPageCard>

        <UPageCard title="時間割コード" icon="mdi:code-tags" class="items-start">
          <div class="flex flex-col items-start gap-2">
            <span class="select-all">{{ lecture.timeTableCode }}</span>
          </div>
        </UPageCard>

        <UPageCard title="単位区分・進級審査" icon="mdi:book-open-variant" class="md:col-span-2">
          <UAlert
            color="warning"
            variant="subtle"
            description="以下の情報は完全ではない可能性があります。履修の判断にあたっては、必ずシラバス・学修要覧を確認してください。"
          />

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

                    <div v-if="req.isDirectlyRequired" class="mb-2">
                      この審査の要件に含まれることが明記されています。
                    </div>

                    <div v-else class="flex flex-col gap-8">
                      <div v-for="(detail, idx) in req.categoryDetails" :key="idx" class="flex flex-col gap-2">
                        <UBreadcrumb
                          v-for="cat in detail.categories"
                          :key="cat.id"
                          :items="cat.name.map(label => ({ label }))"
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

        <UPageCard title="履修条件" icon="mdi:clipboard-list" class="md:col-span-2">
          <div v-if="lecture.prerequisites.length === 0" class="text-sm text-muted py-4">
            表示可能な情報は見つかりませんでした。
          </div>
          <div v-else class="flex flex-row flex-wrap gap-8">
            <template
              v-for="prereq in lecture.prerequisites.filter(prereq => prereq.year === 2026)"
              class="flex flex-col gap-2"
            >
              <div class="flex flex-row items-center gap-2" v-if="prereq.category">
                {{ prereq.category.name.ja }}
                <span class="text-muted">を履修していること</span>
              </div>
              <div class="flex flex-row items-center gap-2" v-if="prereq.course">
                <UButton variant="outline" :to="`/lectures/?q=${prereq.course.name.ja}`">
                  {{ prereq.course.name.ja }}
                </UButton>
                <span class="text-muted">を履修していること</span>
              </div>
              <div class="flex flex-row items-center gap-2" v-if="prereq.checkpoint">
                {{ prereq.checkpoint.name.ja }}
                <span class="text-muted">に合格していること</span>
              </div>
            </template>
          </div>
        </UPageCard>
      </div>
    </UContainer>
  </UMain>
</template>
