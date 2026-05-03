import { Checkpoint, type RawCheckpoint } from "#shared/models/Checkpoint";
import { Course, type RawCourse } from "#shared/models/Course";
import { CourseCategory, type RawCourseCategory } from "#shared/models/CourseCategory";
import { CourseCategoryMapping, type RawCourseCategoryMapping } from "#shared/models/CourseCategoryMapping";
import { Lecture, type RawLecture } from "#shared/models/Lecture";
import { Organization, type RawOrganization } from "#shared/models/Organization";
import { Person, type RawPerson } from "#shared/models/Person";
import { uar } from "#shared/utils";
import { ancestors, descendantsBFS } from "#shared/utils/tree";
import type { I18NString } from "~~/shared/types/rdf";

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
    organizations: Map<string, Organization>;
    people: Map<string, Person>;
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

    this.data = { courses, categories, checkpoints, mappings, lectures, organizations, people };
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
    const ids = new Set<string>([org.id]);
    for (const parent of ancestors(org, (item) => item.subOrganizationOf.at(0))) {
      ids.add(parent.id);
    }
    this.orgAncestorCache.set(org.id, ids);
    return ids;
  }

  getCategoryAncestorIds(cat: CourseCategory): Set<string> {
    const existing = this.categoryAncestorCache.get(cat.id);
    if (existing) return existing;
    const ids = new Set<string>([cat.id]);
    for (const parent of ancestors(cat, (item) => item.subCategoryOf)) {
      ids.add(parent.id);
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

    const relatedOrgIds = new Set<string>(this.getOrgAncestorIds(org));
    for (const child of descendantsBFS(org, (item) => item.hasSubOrganization)) {
      relatedOrgIds.add(child.id);
    }

    const mappings = Array.from(relatedOrgIds).flatMap((orgId) => this.mappingIndex.get(`${year}-${orgId}`) || []);
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
  getMergedCheckpoints() {
    if (!this.data) return null;

    const orgToCheckpoints = new Map<string, Checkpoint[]>();
    for (const cp of this.data.checkpoints.values()) {
      const orgId = cp.targetOrganization?.id;
      if (orgId) {
        const list = orgToCheckpoints.get(orgId) || [];
        list.push(cp);
        orgToCheckpoints.set(orgId, list);
      }
    }

    const mergedCheckpoints = new Map(this.data.checkpoints);
    const getBaseName = (name: I18NString) => {
      const text = name.ja || name.en || "";
      return text.split("-").at(-1)?.trim() || text;
    };

    const organizations = Array.from(this.data.organizations.values());
    const rootOrgs = organizations.filter((org) => org.subOrganizationOf.length === 0);

    for (const rootOrg of rootOrgs) {
      const orgQueue = [rootOrg, ...descendantsBFS(rootOrg, (org) => org.hasSubOrganization)];

      for (const org of orgQueue) {
        const children = org.hasSubOrganization;
        if (children.length === 0) continue;

        const orgCheckpoints = orgToCheckpoints.get(org.id) || [];

        for (const cp of orgCheckpoints) {
          if (!mergedCheckpoints.has(cp.id)) continue;

          const baseName = getBaseName(cp.name);
          const childMatchInfos: { childCp: Checkpoint; childOrgId: string }[] = [];

          for (const childOrg of children) {
            const match = (orgToCheckpoints.get(childOrg.id) || []).find(
              (ccp) => getBaseName(ccp.name) === baseName && ccp.year === cp.year,
            );
            if (match) {
              childMatchInfos.push({ childCp: match, childOrgId: childOrg.id });
            }
          }

          if (childMatchInfos.length === children.length) {
            for (const { childCp } of childMatchInfos) {
              const raw = childCp.toJSON() as unknown as RawCheckpoint;
              const parentRaw = cp.toJSON() as unknown as RawCheckpoint;

              raw.courseRequirements = [...(parentRaw.courseRequirements || []), ...(raw.courseRequirements || [])];
              raw.categoryRequirements = [
                ...(parentRaw.categoryRequirements || []),
                ...(raw.categoryRequirements || []),
              ];

              const updatedChild = new Checkpoint(raw);
              mergedCheckpoints.set(childCp.id, updatedChild);

              const list = orgToCheckpoints.get(childCp.targetOrganization?.id || "");
              if (list) {
                const idx = list.findIndex((c) => c.id === childCp.id);
                list[idx] = updatedChild;
              }
            }
            mergedCheckpoints.delete(cp.id);
          }
        }
      }
    }

    return mergedCheckpoints;
  }
  getMappings() {
    return this.data?.mappings;
  }
  getOrganizations() {
    return this.data?.organizations;
  }
  getPeople() {
    return this.data?.people;
  }
}
