<script lang="ts" setup>
import type { SelectItem } from "@nuxt/ui";

const { search, terms, periods } = useLectureFilter();

const termItems: SelectItem[] = [
  { label: "前学期", value: "前学期" },
  { label: "後学期", value: "後学期" },
  { type: "separator" },
  { label: "前学期集中", value: "前学期集中" },
  { label: "後学期集中", value: "後学期集中" },
  { type: "separator" },
  { label: "春ターム", value: "春ターム" },
  { label: "夏ターム", value: "夏ターム" },
  { label: "秋ターム", value: "秋ターム" },
  { label: "冬ターム", value: "冬ターム" },
  { type: "separator" },
  { label: "通年", value: "通年" },
];
</script>

<template>
  <UForm class="space-y-4">
    <UFormField label="講義名・担当教員名"><UInput v-model="search" class="w-full" /></UFormField>
    <UFormField label="開講学期"><USelect v-model="terms" multiple :items="termItems" class="w-full" /></UFormField>
    <UFormField label="曜日・時限"><LecturesLecturePeriodSelect v-model="periods" /></UFormField>
  </UForm>
</template>
