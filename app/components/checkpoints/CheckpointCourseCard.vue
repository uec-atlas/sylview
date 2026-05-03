<script lang="ts" setup>
type CheckpointCourse = {
  id: string;
  name: I18NString;
  credits?: number;
};

interface Props {
  courses: CheckpointCourse[];
}
const { courses } = defineProps<Props>();
</script>

<template>
  <UPageCard title="必修科目" icon="mdi:file-check-outline" class="items-start" v-if="courses.length">
    <div class="flex flex-row flex-wrap gap-2">
      <UButton
        v-for="course in courses"
        :key="course.id"
        variant="outline"
        :to="`/lectures?q=${course.name.ja || course.name.en}`"
        >{{ course.name.ja || course.name.en }}</UButton
      >
    </div>
  </UPageCard>
</template>
