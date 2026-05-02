<script lang="ts" setup>
const selectedPeriods = defineModel<string[]>({ required: true, default: () => [] });

const days = ["月", "火", "水", "木", "金", "土"];
const periods = ["1", "2", "3", "4", "5", "6", "7"];

const isSelected = (key: string) => selectedPeriods.value.includes(key);

const fillPeriods = (key: string) => {
  let newValue = new Set(selectedPeriods.value);
  const targets: string[] = [];
  for (const day of days) {
    for (const period of periods) {
      if (day === key || period === key) {
        targets.push(`${day}${period}`);
      }
    }
  }
  const allSelected = targets.every((t) => newValue.has(t));
  if (allSelected) {
    for (const t of targets) {
      newValue.delete(t);
    }
  } else {
    for (const t of targets) {
      newValue.add(t);
    }
  }
  selectedPeriods.value = Array.from(newValue).sort(periodComparator);
};

const periodComparator = (a: string, b: string) => {
  if (a === "他") return 1;
  if (b === "他") return -1;

  const dayA = a.slice(0, 1);
  const dayB = b.slice(0, 1);
  const periodA = parseInt(a.slice(1));
  const periodB = parseInt(b.slice(1));

  if (dayA === dayB) {
    return periodA - periodB;
  }
  return days.indexOf(dayA) - days.indexOf(dayB);
};

const togglePeriod = (key: string, checked: boolean) => {
  let newValue = [...selectedPeriods.value];

  if (checked) {
    if (!newValue.includes(key)) newValue.push(key);
  } else {
    newValue = newValue.filter((item) => item !== key);
  }

  selectedPeriods.value = newValue.sort(periodComparator);
};
</script>

<template>
  <div class="flex flex-col gap-4 w-full items-center">
    <table class="table-fixed border-collapse w-fit text-center">
      <thead>
        <tr>
          <th class="w-10"></th>
          <th v-for="day in days" :key="day">
            <UButton color="neutral" variant="ghost" @click="fillPeriods(day)" class="px-2 py-1">{{ day }}</UButton>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="period in periods" :key="period">
          <td>
            <UButton color="neutral" variant="ghost" @click="fillPeriods(period)" class="p-1">{{ period }}</UButton>
          </td>
          <td v-for="day in days" :key="day">
            <UCheckbox
              :id="useId()"
              :modelValue="isSelected(`${day}${period}`)"
              @update:modelValue="(val) => togglePeriod(`${day}${period}`, !!val)"
              :label="`${day}${period}`"
              :ui="{ root: 'w-full justify-center', wrapper: 'sr-only' }"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <UCheckbox
      :id="useId()"
      :modelValue="isSelected('他')"
      @update:modelValue="(val) => togglePeriod('他', !!val)"
      label="その他の時間帯・時間指定なし"
    />
  </div>
</template>
