<script lang="ts" setup>
import type { PageCardProps } from "@nuxt/ui";

const { data: organizations } = await useFetch("/api/organizations");
const organizationMap = new Map(organizations.value?.map((org) => [org.id, org]) ?? []);
const { data: checkpoints } = await useFetch("/api/checkpoints");

const { orgId, entranceYear } = useCheckpointFilter();
const targetOrgIds = computed(() => {
  if (!orgId.value) return null;
  const org = organizationMap.get(orgId.value);
  if (!org) return null;
  return new Set([org.id, ...(org.ancestors.map((a) => a.id) ?? []), ...(org.descendants.map((d) => d.id) ?? [])]);
});

const items: (PageCardProps & { id: string })[] =
  checkpoints.value?.map((checkpoint) => ({
    id: checkpoint.id,
    title: checkpoint.name.ja.split("-").pop()?.trim() || "",
    description: organizationMap.get(checkpoint.targetOrganization ?? "")?.name.ja || "",
    to: `/checkpoints/${checkpoint.id.split("/").pop()}`,
    icon: "mdi:clipboard-check-outline",
  })) || [];

const filteredItems = computed(() => {
  return items.filter((item) => {
    const checkpoint = checkpoints.value?.find((c) => c.id === item.id);
    if (!checkpoint) return false;
    if (orgId.value && checkpoint.targetOrganization && !targetOrgIds.value?.has(checkpoint.targetOrganization))
      return false;
    if (entranceYear.value && checkpoint.year !== entranceYear.value) return false;
    return true;
  });
});
</script>

<template>
  <UPageList class="w-full space-y-4">
    <UPageCard
      v-for="item in filteredItems"
      :key="item.id"
      v-bind="item"
      variant="outline"
      :ui="{ container: 'sm:p-4'}"
    />
    <p v-if="filteredItems.length === 0" class="text-center py-8 text-muted">
      条件に一致する進級審査データが見つかりませんでした。 入学年度を変更してもう一度お試しください。
    </p>
  </UPageList>
</template>
