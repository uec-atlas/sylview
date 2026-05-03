<script lang="ts" setup>
import type { AccordionItem } from "@nuxt/ui";
import * as R from "remeda";

type CategoryRequirement = {
  minCredits?: number;
  description?: string;
  targetCategories?: {
    id: string;
    name: string[];
    targetCourses: {
      id: string;
      name: I18NString;
      credits?: number;
    }[];
  }[];
};

interface Props {
  requirement: CategoryRequirement;
}
const { requirement } = defineProps<Props>();

const accordionItems =
  requirement.targetCategories?.map(
    (category) =>
      ({
        ...category,
        totalCourseCount: category.targetCourses.length,
        totalCreditCount: category.targetCourses ? R.sumBy(category.targetCourses, (c) => c.credits || 0) : 0,
      }) satisfies AccordionItem,
  ) ?? [];

const isExact = requirement.minCredits === R.sumBy(accordionItems, (c) => c.totalCreditCount);
const hasCategory = requirement.targetCategories && requirement.targetCategories.length > 0;
</script>

<template>
  <UPageCard icon="mdi:folder-check-outline" class="items-start">
    <template #title>
      <div class="flex flex-row items-center justify-between gap-2">
        <span>{{ hasCategory ? '必修区分': '全科目合計' }}</span>
        <UBadge variant="subtle">{{ requirement.minCredits }}単位<span v-if="!isExact">～</span></UBadge>
      </div>
    </template>
    <p v-if="requirement.description" class="text-sm text-muted align-middle">
      <Icon name="mdi:information-outline" class="inline-block -mb-px" />
      {{ requirement.description }}
    </p>
    <UAccordion :items="accordionItems">
      <template #leading="{ item }">
        <UBreadcrumb :items="item.name.map(label => ({ label }))" :ui="{ list: 'flex-wrap'}" />
      </template>
      <template #body="{ item }">
        <div class="flex flex-col gap-4">
          <p class="text-sm text-muted">全{{ item.totalCourseCount }}科目 {{ item.totalCreditCount }}単位</p>
          <div v-if="item.targetCourses.length > 0" class="flex flex-row flex-wrap gap-2">
            <UButton
              v-for="course in item.targetCourses"
              :key="course.id"
              variant="outline"
              :to="`/lectures?q=${course.name.ja || course.name.en}`"
              >{{ course.name.ja || course.name.en }}</UButton
            >
          </div>
        </div>
      </template>
    </UAccordion>
  </UPageCard>
</template>
