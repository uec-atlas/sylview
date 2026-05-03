<script lang="ts" setup generic="M extends boolean = false">
import type { TreeItemSelectEvent } from "reka-ui";

const { multiple = false } = defineProps<{
  multiple?: M;
}>();

const modelValue = defineModel<M extends true ? string[] : string | null>();

const { data: organizations } = await useFetch("/api/organizations");
type Organization = NonNullable<typeof organizations.value>[number];
const organizationMap = new Map(organizations.value?.map((org) => [org.id, org]) ?? []);

type TreeItem = {
  id: string;
  label: string;
  children?: TreeItem[];
};

const toTreeItems = (orgs: Organization[]): TreeItem[] =>
  orgs
    .map((org) => ({
      id: org.id,
      label: org.name.ja,
      children: toTreeItems(
        org.hasSubOrganization.map((id) => organizationMap.get(id)).filter((o): o is Organization => !!o) ?? [],
      ),
    }))
    .sort((a, b) => compareJaString(a.label, b.label));

function onSelect(e: TreeItemSelectEvent<TreeItem>) {
  if (e.detail.originalEvent.type === "click" && e.detail.value?.children?.length) {
    e.preventDefault();
  }
}

const treeItems = toTreeItems(
  organizations.value?.filter((org) => org.subOrganizationOf.includes("uar:organizations/UEC")) ?? [],
);

const selected = computed<M extends true ? TreeItem[] : TreeItem | null>({
  get(): M extends true ? TreeItem[] : TreeItem | null {
    if (multiple) {
      const values = new Set(modelValue.value);
      // @ts-expect-error
      return treeItems
        .flatMap((item) => [item, ...descendantsBFS(item, (i) => i.children ?? [])])
        .filter((item) => values.has(item.id));
    } else {
      // @ts-expect-error
      return (
        treeItems
          .flatMap((item) => [item, ...descendantsBFS(item, (i) => i.children ?? [])])
          .find((item) => item.id === modelValue.value) || null
      );
    }
  },
  set(value) {
    if (multiple) {
      // @ts-expect-error
      modelValue.value = (value as TreeItem[]).map((item) => item.id);
    } else {
      // @ts-expect-error
      modelValue.value = (value as TreeItem | null)?.id || null;
    }
  },
});

const selectedLabels = computed(() => {
  const items = Array.isArray(selected.value) ? [...selected.value] : selected.value ? [selected.value] : [];
  const selectedIds = new Set(items.map((i) => i.id));
  const filtered = items.filter((item) => {
    return !organizationMap.get(item.id)?.ancestors?.find(({ id }) => selectedIds.has(id));
  });
  return filtered.map((i) => i.label).join(", ");
});
</script>

<template>
  <UPopover :ui="{ content: 'w-(--reka-popover-trigger-width) overflow-x-auto max-h-80 p-2' }">
    <UButton trailing-icon="lucide:chevron-down" color="neutral" variant="outline" block>
      {{ selectedLabels }}
    </UButton>

    <template #content>
      <div class="min-w-full w-fit">
        <!-- @vue-expect-error -->
        <UTree
          v-model="selected"
          :multiple="multiple"
          propagate-select
          bubble-select
          :items="treeItems"
          @select="onSelect"
          :getKey="item => item.id"
          >>
          <template #item-leading="{ selected, indeterminate, handleSelect }">
            <UCheckbox
              :model-value="indeterminate ? 'indeterminate' : selected"
              tabindex="-1"
              @change="handleSelect"
              @click.stop
            />
          </template>
        </UTree>
      </div>
    </template>
  </UPopover>
</template>
