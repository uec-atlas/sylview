import type { Organization } from "~/composables/useOrganizationData";
import type { Person } from "~/composables/usePeopleData";
import type { I18NString } from "~/types/rdf";

type ResourceId = string;

interface NamedThingWithId {
  id: ResourceId;
  name: I18NString;
}

export interface CodeMapping {
  code: string;
  years?: number[];
}

interface RawCoursePrerequisite {
  year?: number;
  checkpoint?: ResourceId;
  category?: ResourceId;
  course?: ResourceId;
}

interface RawCourse extends NamedThingWithId {
  type: "Course";
  numberOfCredits?: number;
  succeededBy?: ResourceId;
  codeMappings?: CodeMapping[];
  prerequisites?: RawCoursePrerequisite[];
  organizations?: ResourceId[];
  requiresCourses?: ResourceId[];
  requiredBy?: ResourceId[];
  lectures?: ResourceId[];
}

export interface CoursePrerequisite {
  year?: number;
  checkpoint?: Checkpoint;
  category?: CourseCategory;
  course?: Course;
}

export interface Course extends NamedThingWithId {
  type: "Course";
  numberOfCredits?: number;
  succeededBy?: Course;
  codeMappings: CodeMapping[];
  prerequisites: CoursePrerequisite[];
  organizations: Set<Organization>;
  requiresCourses: Set<Course>;
  requiredBy: Set<Course>;
  lectures: Set<Lecture>;
}

interface RawLecture extends NamedThingWithId {
  type: "Lecture";
  year: number;
  sourceUrl?: string;
  instructors?: ResourceId[];
  term?: string;
  periods?: string[];
  timeTableCode?: string;
  numberOfCredits?: number;
  targetGrades?: number[];
  courses?: ResourceId[];
}

export interface Lecture extends NamedThingWithId {
  type: "Lecture";
  year: number;
  sourceUrl?: string;
  instructors: Set<Person>;
  term?: string;
  periods: string[];
  timeTableCode?: string;
  numberOfCredits?: number;
  targetGrades: number[];
  courses: Set<Course>;
}

interface RawCourseCategory extends NamedThingWithId {
  type: "CourseCategory";
  subCategoryOf?: ResourceId;
  hasSubCategory?: ResourceId[];
}

export interface CourseCategory extends NamedThingWithId {
  type?: "CourseCategory";
  subCategoryOf: CourseCategory | null;
  hasSubCategory: Set<CourseCategory>;
}

interface RawCurriculumEntry extends NamedThingWithId {
  type: string;
  targetOrganization?: ResourceId;
  targetGrades?: number[];
  year?: number;
}

interface CurriculumEntry extends NamedThingWithId {
  type: string;
  targetOrganization?: Organization;
  targetGrades: number[];
  year?: number;
}

interface RawCategoryRequirement {
  targetCategories?: ResourceId[];
  minCredits?: number;
  description?: string;
}

export interface CategoryRequirement {
  targetCategories: Set<CourseCategory>;
  minCredits?: number;
  description?: string;
}

interface RawCourseCategoryMapping extends RawCurriculumEntry {
  type: "CourseCategoryMapping";
  category: ResourceId;
  courses?: ResourceId[];
}

export interface CourseCategoryMapping extends CurriculumEntry {
  type: "CourseCategoryMapping";
  category: CourseCategory;
  courses: Set<Course>;
}

interface RawCheckpoint extends RawCurriculumEntry {
  type: "Checkpoint";
  courseRequirements?: ResourceId[];
  categoryRequirements?: RawCategoryRequirement[];
}

export interface Checkpoint extends CurriculumEntry {
  type: "Checkpoint";
  courseRequirements: Set<Course>;
  categoryRequirements: CategoryRequirement[];
}

export type Curriculum = CourseCategoryMapping | Checkpoint;
export type EducationItem = Course | CourseCategory | Curriculum | Lecture;

type RawEducationItem = RawCourse | RawLecture | RawCourseCategory | RawCourseCategoryMapping | RawCheckpoint;

interface EducationResponse {
  items?: RawEducationItem[];
}

let educationItemsCache: RawEducationItem[] | null = null;

const fetchEducationItems = async () => {
  if (educationItemsCache) {
    return educationItemsCache;
  }

  const response = await $fetch<EducationResponse>(uar`/education/all`);
  const items = response.items || [];

  educationItemsCache = items;

  return items;
};

interface EducationSourceData {
  items: RawEducationItem[];
  organizations: Map<ResourceId, Organization>;
  people: Map<ResourceId, Person>;
}

export interface EducationData {
  courses: Map<ResourceId, Course>;
  categories: Map<ResourceId, CourseCategory>;
  curriculum: Map<ResourceId, Curriculum>;
  lectures: Map<ResourceId, Lecture>;
}

const createEmptyEducationData = (): EducationData => {
  return {
    courses: new Map<ResourceId, Course>(),
    categories: new Map<ResourceId, CourseCategory>(),
    curriculum: new Map<ResourceId, Curriculum>(),
    lectures: new Map<ResourceId, Lecture>(),
  };
};

const mapById = <T extends { id: ResourceId }>(items: T[]): Map<ResourceId, T> => {
  return new Map(items.map((item) => [item.id, item]));
};

const resolveOne = <T>(id: ResourceId | undefined, dictionary: Map<ResourceId, T>): T | undefined => {
  if (!id) {
    return undefined;
  }

  return dictionary.get(id);
};

const resolveMany = <T>(ids: ResourceId[] | undefined, dictionary: Map<ResourceId, T>): T[] => {
  if (!ids) {
    return [];
  }

  const resolved: T[] = [];
  for (const id of ids) {
    const value = dictionary.get(id);
    if (value) {
      resolved.push(value);
    }
  }

  return resolved;
};

const isCourse = (item: RawEducationItem): item is RawCourse => item.type === "Course";

const isLecture = (item: RawEducationItem): item is RawLecture => item.type === "Lecture";

const isCourseCategory = (item: RawEducationItem): item is RawCourseCategory => item.type === "CourseCategory";

const isCourseCategoryMapping = (item: RawEducationItem): item is RawCourseCategoryMapping => {
  return item.type === "CourseCategoryMapping";
};

const isCheckpoint = (item: RawEducationItem): item is RawCheckpoint => item.type === "Checkpoint";

const toCourse = (raw: RawCourse): Course => {
  return {
    id: raw.id,
    type: "Course",
    name: raw.name,
    numberOfCredits: raw.numberOfCredits,
    succeededBy: undefined,
    codeMappings: raw.codeMappings || [],
    prerequisites: [],
    organizations: new Set(),
    requiresCourses: new Set(),
    requiredBy: new Set(),
    lectures: new Set(),
  };
};

const toLecture = (raw: RawLecture): Lecture => {
  return {
    id: raw.id,
    type: "Lecture",
    name: raw.name,
    year: raw.year,
    sourceUrl: raw.sourceUrl,
    instructors: new Set(),
    term: raw.term,
    periods: raw.periods || [],
    timeTableCode: raw.timeTableCode,
    numberOfCredits: raw.numberOfCredits,
    targetGrades: raw.targetGrades || [],
    courses: new Set(),
  };
};

const toCategory = (raw: RawCourseCategory): CourseCategory => {
  return {
    id: raw.id,
    type: "CourseCategory",
    name: raw.name,
    subCategoryOf: null,
    hasSubCategory: new Set(),
  };
};

const toCourseCategoryMapping = (raw: RawCourseCategoryMapping): CourseCategoryMapping => {
  return {
    id: raw.id,
    type: "CourseCategoryMapping",
    name: raw.name,
    year: raw.year,
    targetOrganization: undefined,
    targetGrades: raw.targetGrades || [],
    category: {} as CourseCategory,
    courses: new Set(),
  };
};

const toCheckpoint = (raw: RawCheckpoint): Checkpoint => {
  return {
    id: raw.id,
    type: "Checkpoint",
    name: raw.name,
    year: raw.year,
    targetOrganization: undefined,
    targetGrades: raw.targetGrades || [],
    courseRequirements: new Set(),
    categoryRequirements: [],
  };
};

const linkCategoryRelations = (
  rawCategories: RawCourseCategory[],
  categories: Map<ResourceId, CourseCategory>,
): void => {
  for (const rawCategory of rawCategories) {
    const category = categories.get(rawCategory.id);
    if (!category) {
      continue;
    }

    const parent = resolveOne(rawCategory.subCategoryOf, categories);
    if (parent) {
      category.subCategoryOf = parent;
      parent.hasSubCategory.add(category);
    }

    for (const child of resolveMany(rawCategory.hasSubCategory, categories)) {
      category.hasSubCategory.add(child);
      child.subCategoryOf ??= category;
    }
  }
};

const linkCourses = (
  rawCourses: RawCourse[],
  courses: Map<ResourceId, Course>,
  categories: Map<ResourceId, CourseCategory>,
  curriculum: Map<ResourceId, Curriculum>,
  lectures: Map<ResourceId, Lecture>,
  organizations: Map<ResourceId, Organization>,
): void => {
  for (const rawCourse of rawCourses) {
    const course = courses.get(rawCourse.id);
    if (!course) {
      continue;
    }

    course.organizations = new Set(resolveMany(rawCourse.organizations, organizations));
    course.succeededBy = resolveOne(rawCourse.succeededBy, courses);

    for (const required of resolveMany(rawCourse.requiresCourses, courses)) {
      course.requiresCourses.add(required);
      required.requiredBy.add(course);
    }

    for (const requiredBy of resolveMany(rawCourse.requiredBy, courses)) {
      course.requiredBy.add(requiredBy);
      requiredBy.requiresCourses.add(course);
    }

    for (const lecture of resolveMany(rawCourse.lectures, lectures)) {
      course.lectures.add(lecture);
      lecture.courses.add(course);
    }

    course.prerequisites = (rawCourse.prerequisites || []).map((prerequisite) => {
      const checkpoint = resolveOne(prerequisite.checkpoint, curriculum);

      return {
        year: prerequisite.year,
        checkpoint: checkpoint?.type === "Checkpoint" ? checkpoint : undefined,
        category: resolveOne(prerequisite.category, categories),
        course: resolveOne(prerequisite.course, courses),
      };
    });
  }
};

const linkLectures = (
  rawLectures: RawLecture[],
  lectures: Map<ResourceId, Lecture>,
  courses: Map<ResourceId, Course>,
  people: Map<ResourceId, Person>,
): void => {
  for (const rawLecture of rawLectures) {
    const lecture = lectures.get(rawLecture.id);
    if (!lecture) {
      continue;
    }

    lecture.instructors = new Set(resolveMany(rawLecture.instructors, people));

    for (const course of resolveMany(rawLecture.courses, courses)) {
      lecture.courses.add(course);
      course.lectures.add(lecture);
    }
  }
};

const linkCurriculum = (
  rawMappings: RawCourseCategoryMapping[],
  rawCheckpoints: RawCheckpoint[],
  curriculum: Map<ResourceId, Curriculum>,
  categories: Map<ResourceId, CourseCategory>,
  courses: Map<ResourceId, Course>,
  organizations: Map<ResourceId, Organization>,
): void => {
  for (const rawMapping of rawMappings) {
    const mapping = curriculum.get(rawMapping.id);
    if (!mapping || mapping.type !== "CourseCategoryMapping") {
      continue;
    }

    mapping.targetOrganization = resolveOne(rawMapping.targetOrganization, organizations);
    mapping.category = resolveOne(rawMapping.category, categories) || ({} as CourseCategory);
    mapping.courses = new Set(resolveMany(rawMapping.courses, courses));
  }

  for (const rawCheckpoint of rawCheckpoints) {
    const checkpoint = curriculum.get(rawCheckpoint.id);
    if (!checkpoint || checkpoint.type !== "Checkpoint") {
      continue;
    }

    checkpoint.targetOrganization = resolveOne(rawCheckpoint.targetOrganization, organizations);
    checkpoint.courseRequirements = new Set(resolveMany(rawCheckpoint.courseRequirements, courses));
    checkpoint.categoryRequirements = (rawCheckpoint.categoryRequirements || []).map((categoryRequirement) => ({
      minCredits: categoryRequirement.minCredits,
      description: categoryRequirement.description,
      targetCategories: new Set(resolveMany(categoryRequirement.targetCategories, categories)),
    }));
  }
};

const resolveEducationData = (source: EducationSourceData): EducationData => {
  const rawCourses = source.items.filter(isCourse);
  const rawLectures = source.items.filter(isLecture);
  const rawCategories = source.items.filter(isCourseCategory);
  const rawMappings = source.items.filter(isCourseCategoryMapping);
  const rawCheckpoints = source.items.filter(isCheckpoint);

  const organizations = source.organizations;
  const people = source.people;

  const courses = mapById(rawCourses.map(toCourse));
  const lectures = mapById(rawLectures.map(toLecture));
  const categories = mapById(rawCategories.map(toCategory));

  const curriculum = new Map<ResourceId, Curriculum>();
  for (const rawMapping of rawMappings) {
    curriculum.set(rawMapping.id, toCourseCategoryMapping(rawMapping));
  }
  for (const rawCheckpoint of rawCheckpoints) {
    curriculum.set(rawCheckpoint.id, toCheckpoint(rawCheckpoint));
  }

  linkCategoryRelations(rawCategories, categories);
  linkCourses(rawCourses, courses, categories, curriculum, lectures, organizations);
  linkLectures(rawLectures, lectures, courses, people);
  linkCurriculum(rawMappings, rawCheckpoints, curriculum, categories, courses, organizations);

  return {
    courses,
    categories,
    curriculum,
    lectures,
  };
};

const useRawEducationData = () =>
  useAsyncData("educationItems", async () => fetchEducationItems(), {
    default: () => [],
    deep: false,
    dedupe: "defer",
  });

export const useEducationData = () => {
  const education = useRawEducationData();
  const organizations = useOrganizationData();
  const people = usePeopleData();

  const resolved = useAsyncData(
    "education",
    async () => {
      await Promise.all([education, organizations, people]);

      return resolveEducationData({
        items: education.data.value || [],
        organizations: organizations.data.value || new Map<ResourceId, Organization>(),
        people: people.data.value || new Map<ResourceId, Person>(),
      });
    },
    {
      default: createEmptyEducationData,
      watch: [education.data, organizations.data, people.data],
      deep: false,
      dedupe: "defer",
    },
  );

  return resolved;
};

const useEducationMapData = <T>(key: string, selector: (data: EducationData) => Map<ResourceId, T>) => {
  const all = useEducationData();

  return useAsyncData<Map<ResourceId, T>>(
    key,
    async () => selector((await all).data.value || createEmptyEducationData()),
    {
      default: () => new Map<ResourceId, T>(),
      watch: [all.data],
      deep: false,
      dedupe: "defer",
    },
  );
};

export const useEducationCoursesData = () => useEducationMapData("educationCourses", (data) => data.courses);
export const useEducationCategoriesData = () => useEducationMapData("educationCategories", (data) => data.categories);
export const useEducationCurriculumData = () => useEducationMapData("educationCurriculum", (data) => data.curriculum);
export const useEducationLecturesData = () => useEducationMapData("educationLectures", (data) => data.lectures);
