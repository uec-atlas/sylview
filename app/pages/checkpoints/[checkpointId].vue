<script lang="ts" setup>
const checkpointId = useRoute().params.checkpointId;
const { data: _checkpoint } = await useFetch(`/api/checkpoints/${checkpointId}`);
const checkpoint = _checkpoint.value;
if (!checkpoint) {
  throw createError({ statusCode: 404, statusMessage: "Checkpoint not found" });
}

const isFromCheckpointList = useState("isFromCheckpointList", () => false);
definePageMeta({
  layout: "app",
  middleware: (_to, from) => {
    if (from.path === "/checkpoints") {
      const isFromCheckpointList = useState("isFromCheckpointList", () => false);
      isFromCheckpointList.value = true;
    }
  },
});
useSeoMeta({ title: checkpoint.name.ja });

const router = useRouter();
</script>

<template>
  <UMain :ui="{ base: 'min-h-full' }">
    <UContainer :ui="{ base: 'flex flex-col gap-4 mb-4' }">
      <UPageHeader :title="checkpoint.name.ja">
        <template #headline>
          <UButton
            @click="() => { isFromCheckpointList && router.back() }"
            :href="isFromCheckpointList ? undefined: '/checkpoints'"
            variant="link"
            icon="mdi:arrow-left"
            class="self-start px-0"
            >進級審査一覧に戻る</UButton
          >
        </template>
        <template #description>
          <p class="space-x-4 text-sm">
            <span v-if="checkpoint.targetOrganizationName">{{ checkpoint.targetOrganizationName.join(" ") }}</span>
            <span>{{ checkpoint.year }}年度入学生</span>
          </p>
        </template>
      </UPageHeader>

      <UAlert color="warning" variant="subtle" description="進級審査の詳細な要件は学修要覧を確認してください。" />
      <CheckpointsCheckpointCourseCard :courses="checkpoint.courseRequirements" />
      <CheckpointsCheckpointCategoryCard
        v-for="(req, idx) in checkpoint.categoryRequirements"
        :key="idx"
        :requirement="req"
      />
    </UContainer>
  </UMain>
</template>
