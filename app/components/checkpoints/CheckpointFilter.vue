<script lang="ts" setup>
import type { SelectItem } from "@nuxt/ui";

const { orgId, entranceYear } = useCheckpointFilter();
const entranceYearOptions: SelectItem[] = [2026, 2025, 2024, 2023].map((year) => ({
  label: `${year}年度`,
  value: year,
}));
</script>

<template>
  <UForm class="space-y-4">
    <UFormField label="所属"><OrganizationSelect v-model="orgId" /></UFormField>
    <UFormField label="入学年度"> <USelect v-model="entranceYear" :items="entranceYearOptions" /> </UFormField>
  </UForm>
</template>
