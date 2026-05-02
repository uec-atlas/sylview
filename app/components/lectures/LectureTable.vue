<script lang="ts" setup>
import type { TableColumn, TableRow } from "@nuxt/ui";
import * as R from "remeda";

interface TreeLectureItem extends Partial<Lecture> {
  displayName: string;
  children?: TreeLectureItem[];
  isGroup: boolean;
}

const { data } = await useFetch("/api/lectures");

const lectures = computed(() =>
  data.value
    ? Object.values(data.value)
        .map((lecture): Lecture & { displayName: string; groupKey: string; searchKey: string } =>
          Object.assign(Object.create(lecture), {
            displayName: lecture.name.ja,
            groupKey: lecture.name.ja.replace(/\(.+?\)/g, "").trim(),
            searchKey:
              `${lecture.name.ja} ${lecture.name.en} ${lecture.instructors?.map((i) => (i.name?.ja ?? "") + (i.name?.en ?? "")).join(" ")}`.toLowerCase(),
          }),
        )
        .sort(sortByName)
    : [],
);

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
  return `/lectures/${lecture.id?.split("/").pop()}/`;
};

const onSelectRow = (_event: Event, row: TableRow<TreeLectureItem>) => {
  if (row.original.isGroup) {
    row.getToggleExpandedHandler()();
    return;
  }
  navigateTo(toLectureDetailPath(row.original));
};

const { search, terms, periods } = useLectureFilter();
const searchDebounced = useDebounce(search, 100);
const keywords = computed(() =>
  searchDebounced.value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((k) => k.length > 0),
);

const lecturesTree = computed<TreeLectureItem[]>(() =>
  R.pipe(
    lectures.value,
    R.filter((lecture) => lecture.year === 2026),
    R.filter((lecture) => {
      if (terms.value.length === 0) return true;
      return !!(lecture.term && terms.value.includes(lecture.term));
    }),
    R.filter((lecture) => {
      if (periods.value.length === 0) return true;
      return !!lecture.periods?.some((p) => periods.value.includes(p));
    }),
    R.filter((lecture) => {
      if (keywords.value.length === 0) return true;
      return keywords.value.every((keyword) => lecture.searchKey.includes(keyword));
    }),
    R.groupByProp("groupKey"),
    R.entries(),
    R.map(([groupName, groupItems]): TreeLectureItem => {
      if (groupItems.length === 1) {
        return Object.assign(Object.create(groupItems[0]), {
          displayName: groupItems[0].displayName,
          isGroup: false,
        });
      }

      return {
        displayName: groupName,
        isGroup: true,
        children: groupItems.map((item) =>
          Object.assign(Object.create(item), {
            displayName: item.displayName,
            isGroup: false,
          }),
        ),
      };
    }),
    R.sort((a, b) => compareJaString(a.displayName, b.displayName)),
  ),
);
</script>

<template>
  <UTable
    :data="lecturesTree"
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
        <span class="w-8 grid place-items-center shrink-0">
          <UButton
            v-if="row.getCanExpand()"
            :icon="row.getIsExpanded() ? 'mdi:minus' : 'mdi:plus'"
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
</template>
