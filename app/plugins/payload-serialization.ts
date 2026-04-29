import { markRaw, toRaw } from "vue";
import { Checkpoint } from "#shared/models/Checkpoint";
import { Course, CoursePrerequisite } from "#shared/models/Course";
import { CourseCategory } from "#shared/models/CourseCategory";
import { CourseCategoryMapping } from "#shared/models/CourseCategoryMapping";
import { Lecture } from "#shared/models/Lecture";
import { Organization } from "#shared/models/Organization";
import { Person } from "#shared/models/Person";

const entityClasses = {
  Organization,
  Person,
  Course,
  Lecture,
  CourseCategory,
  CourseCategoryMapping,
  Checkpoint,
  CoursePrerequisite,
};

export default definePayloadPlugin((_nuxtApp) => {
  for (const [className, Clazz] of Object.entries(entityClasses)) {
    definePayloadReducer(className, (value) => {
      const rawValue = toRaw(value);
      return rawValue instanceof Clazz && rawValue.toJSON();
    });
    definePayloadReviver(className, (data) => {
      return markRaw(new Clazz(data));
    });
  }
});
