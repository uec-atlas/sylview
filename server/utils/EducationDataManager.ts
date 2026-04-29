import { Checkpoint, type RawCheckpoint } from "#shared/models/Checkpoint";
import { Course, type RawCourse } from "#shared/models/Course";
import { CourseCategory, type RawCourseCategory } from "#shared/models/CourseCategory";
import { CourseCategoryMapping, type RawCourseCategoryMapping } from "#shared/models/CourseCategoryMapping";
import { Lecture, type RawLecture } from "#shared/models/Lecture";
import { Organization, type RawOrganization } from "#shared/models/Organization";
import { Person, type RawPerson } from "#shared/models/Person";
import { uar } from "#shared/utils";

type RawEducationItem = RawCourse | RawLecture | RawCourseCategory | RawCourseCategoryMapping | RawCheckpoint;

interface EducationResponse {
  items?: RawEducationItem[];
}

export class EducationDataManager {
  private static instance: EducationDataManager;
  private data: {
    courses: Map<string, Course>;
    categories: Map<string, CourseCategory>;
    checkpoints: Map<string, Checkpoint>;
    mappings: Map<string, CourseCategoryMapping>;
    lectures: Map<string, Lecture>;
  } | null = null;

  private orgAncestorCache = new Map<string, Set<string>>();
  private categoryAncestorCache = new Map<string, Set<string>>();
  private mappingIndex = new Map<string, CourseCategoryMapping[]>();

  public static getInstance(): EducationDataManager {
    if (!EducationDataManager.instance) {
      EducationDataManager.instance = new EducationDataManager();
    }
    return EducationDataManager.instance;
  }

  async ensureLoaded() {
    if (this.data) return;

    const [{ items: organizationItems }, { items: peopleItems }, { items: educationItems }] = await Promise.all([
      $fetch<{ items: RawOrganization[] }>(uar`/organizations/all`),
      $fetch<{ items: RawPerson[] }>(uar`/people/all`),
      $fetch<EducationResponse>(uar`/education/all`),
    ]);

    const organizations = Organization.allOrganizations;
    const people = Person.allPeople;
    const courses = Course.allCourses;
    const categories = CourseCategory.allCategories;
    const checkpoints = Checkpoint.allCheckpoints;
    const mappings = CourseCategoryMapping.allMappings;
    const lectures = Lecture.allLectures;

    for (const item of organizationItems || []) {
      const org = new Organization(item);
      organizations.set(org.id, org);
    }

    for (const item of peopleItems || []) {
      const person = new Person(item);
      people.set(person.id, person);
    }

    for (const item of educationItems || []) {
      if (item.type === "Course") {
        const c = new Course(item as RawCourse);
        courses.set(c.id, c);
      } else if (item.type === "Lecture") {
        const l = new Lecture(item as RawLecture);
        lectures.set(l.id, l);
      } else if (item.type === "CourseCategory") {
        const cat = new CourseCategory(item as RawCourseCategory);
        categories.set(cat.id, cat);
      } else if (item.type === "CourseCategoryMapping") {
        const m = new CourseCategoryMapping(item as RawCourseCategoryMapping);
        mappings.set(m.id, m);
      } else if (item.type === "Checkpoint") {
        const cp = new Checkpoint(item as RawCheckpoint);
        checkpoints.set(cp.id, cp);
      }
    }

    this.data = { courses, categories, checkpoints, mappings, lectures };
    this.buildIndexes();
  }

  private buildIndexes() {
    if (!this.data) return;
    for (const mapping of this.data.mappings.values()) {
      const key = `${mapping.year}-${mapping.targetOrganization?.id}`;
      if (!this.mappingIndex.has(key)) this.mappingIndex.set(key, []);
      this.mappingIndex.get(key)?.push(mapping);
    }
  }

  getOrgAncestorIds(org: Organization): Set<string> {
    const existing = this.orgAncestorCache.get(org.id);
    if (existing) return existing;
    const ids = new Set<string>();
    const stack = [org];
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || ids.has(current.id)) continue;
      ids.add(current.id);
      if (current.subOrganizationOf) stack.push(...current.subOrganizationOf);
    }
    this.orgAncestorCache.set(org.id, ids);
    return ids;
  }

  getCategoryAncestorIds(cat: CourseCategory): Set<string> {
    const existing = this.categoryAncestorCache.get(cat.id);
    if (existing) return existing;
    const ids = new Set<string>();
    const stack = [cat];
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || ids.has(current.id)) continue;
      ids.add(current.id);
      if (current.subCategoryOf) stack.push(current.subCategoryOf);
    }
    this.categoryAncestorCache.set(cat.id, ids);
    return ids;
  }

  isRelatedOrg(orgA: Organization | undefined, orgB: Organization | undefined): boolean {
    if (!orgA || !orgB) return true;
    if (orgA.id === orgB.id) return true;
    const ancestorsA = this.getOrgAncestorIds(orgA);
    const ancestorsB = this.getOrgAncestorIds(orgB);
    return ancestorsA.has(orgB.id) || ancestorsB.has(orgA.id);
  }

  isMatchedCategory(lectureCat: CourseCategory | null | undefined, requiredCat: CourseCategory): boolean {
    if (!lectureCat) return false;
    return this.getCategoryAncestorIds(lectureCat).has(requiredCat.id);
  }

  getCoursesInCategory(year: number, org: Organization | undefined, requiredCat: CourseCategory) {
    if (!org) return [];
    const key = `${year}-${org.id}`;
    const mappings = this.mappingIndex.get(key) || [];
    const courses = mappings
      .filter((m) => m.category && this.isMatchedCategory(m.category, requiredCat))
      .flatMap((m) => [...m.courses]);
    return Array.from(new Set(courses.map((c) => c))).sort((a, b) => a.id.localeCompare(b.id));
  }

  getLecture(id: string) {
    return this.data?.lectures.get(id);
  }
  getLectures() {
    return this.data?.lectures;
  }
  getCheckpoints() {
    return this.data?.checkpoints;
  }
  getMappings() {
    return this.data?.mappings;
  }
}
