<script lang="ts" setup>
import type { TableColumn, TableRow } from "@nuxt/ui";
import * as R from "remeda";

interface TreeLectureItem extends Partial<Lecture> {
  displayName: string;
  children?: TreeLectureItem[];
  isGroup: boolean;
}

definePageMeta({
  layout: "app",
});

useSeoMeta({
  title: "科目検索",
});

const { data } = await useFetch("/api/lectures");

const lectures = computed<TreeLectureItem[]>(() => {
  const rawLectures = data.value
    ? Object.values(data.value)
        .filter((lecture) => lecture.year === 2026)
        .sort(sortByName)
    : [];

  return R.pipe(
    rawLectures,
    R.groupBy((lecture) => lecture.name.ja.replace(/\(.+?\)/g, "").trim()),
    R.entries(),
    R.map(([groupName, groupItems]): TreeLectureItem => {
      if (groupItems.length === 1) {
        return Object.assign(Object.create(groupItems[0]), {
          displayName: groupItems[0].name.ja,
          isGroup: false,
        });
      }

      return {
        displayName: groupName,
        isGroup: true,
        children: groupItems.map((item) =>
          Object.assign(Object.create(item), {
            displayName: item.name.ja,
            isGroup: false,
          }),
        ),
      };
    }),
    R.sort((a, b) => compareJaString(a.displayName, b.displayName)),
  );
});

const columns: TableColumn<TreeLectureItem>[] = [
  {
    id: "name",
    header: "講義名",
  },
  {
    id: "period",
    header: "開講日時",
    meta: {
      class: {
        th: "w-36",
        td: "truncate",
      },
    },
    cell: ({ row }) => {
      if (row.original.isGroup) return "-";
      return `${row.original.term} ${row.original.periods?.join(", ") ?? ""}`;
    },
  },
  {
    id: "instructors",
    header: "担当教員",
    cell: ({ row }) => {
      if (row.original.isGroup) return "-";
      return (
        [...(row.original.instructors ?? [])]
          .map((i) => i.name?.ja)
          .filter((n): n is string => !!n)
          .join(", ") ?? "-"
      );
    },
    meta: {
      class: {
        th: "w-64",
        td: "truncate",
      },
    },
  },
];

const toLectureDetailPath = (lecture: TreeLectureItem) => {
  return `/lectures/${lecture.id?.split("/").pop()}`;
};

const onSelectRow = (_event: Event, row: TableRow<TreeLectureItem>) => {
  if (row.original.isGroup) {
    row.getToggleExpandedHandler()();
    return;
  }
  navigateTo(toLectureDetailPath(row.original));
};

const search = ref("");
const filteredLectures = computed(() => {
  if (!search.value) return lectures.value;

  const lowerSearch = search.value.toLowerCase();
  return lectures.value
    .map((lecture) => {
      if (lecture.isGroup) {
        const filteredChildren = lecture.children?.filter(
          (child) =>
            child.displayName.toLowerCase().includes(lowerSearch) ||
            [...(child.instructors || [])].some((i) => i.name?.ja.toLowerCase().includes(lowerSearch)),
        );
        if (filteredChildren && filteredChildren.length > 0) {
          return { ...lecture, children: filteredChildren };
        }
        return null;
      } else {
        if (
          lecture.displayName.toLowerCase().includes(lowerSearch) ||
          [...(lecture.instructors || [])].some((i) => i.name?.ja.toLowerCase().includes(lowerSearch))
        ) {
          return lecture;
        }
        return null;
      }
    })
    .filter((lec): lec is TreeLectureItem => lec !== null);
});
</script>

<template>
  <div class="h-full flex flex-col gap-4">
    <div class="shrink-0"><UInput v-model="search" placeholder="講義名、担当教員などで検索" clearable /></div>
    <UTable
      :data="filteredLectures"
      :columns="columns"
      :getSubRows="(row) => row.children"
      :ui="{
        root: 'w-full h-full grow min-h-64',
        base: 'flex-1 border-separate border-spacing-0 w-full min-w-3xl table-fixed',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        tr: 'group',
        td: 'empty:p-0 group-has-[td:not(:empty)]:border-b border-default py-3',
      }"
      @select="onSelectRow"
      sticky
      :virtualize="{
      estimateSize: 48,
      overscan: 8,
    }"
    >
      <template #name-cell="{ row }">
        <div class="flex items-center gap-2" :style="{ paddingLeft: `${row.depth * 1}rem` }">
          <span class="w-8 grid place-items-center">
            <UButton
              v-if="row.getCanExpand()"
              :icon="row.getIsExpanded() ? 'i-lucide-minus' : 'i-lucide-plus'"
              size="xs"
              color="neutral"
              variant="outline"
              @click="row.getToggleExpandedHandler()()"
            />
          </span>

          <span v-if="row.original.isGroup" class="truncate">
            {{ row.original.displayName }}
            <span class="text-sm opacity-70"> ({{ row.subRows.length }}件) </span>
          </span>

          <NuxtLink v-else noPrefetch :to="toLectureDetailPath(row.original)" class="truncate">
            {{ row.original.displayName }}
          </NuxtLink>
        </div>
      </template>
    </UTable>
  </div>
</template>
