import type { I18NString } from "#/shared/types/rdf";
import { BaseEntity } from "./BaseEntity";
import { Checkpoint } from "./Checkpoint";
import { CourseCategory } from "./CourseCategory";
import { Lecture } from "./Lecture";
import { Organization } from "./Organization";

export interface CodeMapping {
  code: string;
  years?: number[];
}

export interface RawCoursePrerequisite {
  year?: number;
  checkpoint?: string;
  category?: string;
  course?: string;
}

export class CoursePrerequisite {
  year?: number;
  private _checkpointId?: string;
  private _categoryId?: string;
  private _courseId?: string;

  constructor(raw: RawCoursePrerequisite) {
    this.year = raw.year;
    this._checkpointId = raw.checkpoint;
    this._categoryId = raw.category;
    this._courseId = raw.course;
  }

  get checkpoint(): Checkpoint | undefined {
    if (!this._checkpointId) return undefined;
    return Checkpoint.allCheckpoints.get(this._checkpointId);
  }

  get category(): CourseCategory | undefined {
    if (!this._categoryId) return undefined;
    return CourseCategory.allCategories.get(this._categoryId);
  }

  get course(): Course | undefined {
    if (!this._courseId) return undefined;
    return Course.allCourses.get(this._courseId);
  }

  toJSON(): Record<string, unknown> {
    return {
      year: this.year,
      checkpoint: this._checkpointId,
      category: this._categoryId,
      course: this._courseId,
    };
  }
}

export interface RawCourse {
  id: string;
  type: "Course";
  name: I18NString;
  numberOfCredits?: number;
  succeededBy?: string;
  codeMappings?: CodeMapping[];
  prerequisites?: RawCoursePrerequisite[];
  organizations?: string[];
  requiresCourses?: string[];
  requiredBy?: string[];
  lectures?: string[];
}

export class Course extends BaseEntity {
  type: "Course" = "Course";
  numberOfCredits?: number;
  private _succeededById?: string;
  codeMappings: CodeMapping[] = [];
  private _organizationIds: string[] = [];
  private _requiresCourseIds: string[] = [];
  private _requiredByIds: string[] = [];
  private _lectureIds: string[] = [];
  private _prerequisites: RawCoursePrerequisite[] = [];

  private static _allCourses: Map<string, Course> | null = null;
  static get allCourses() {
    if (!Course._allCourses) Course._allCourses = new Map<string, Course>();
    return Course._allCourses;
  }

  constructor(raw: RawCourse) {
    super(raw.id, raw.name);
    this.numberOfCredits = raw.numberOfCredits;
    this._succeededById = raw.succeededBy;
    this.codeMappings = raw.codeMappings || [];
    this._organizationIds = raw.organizations || [];
    this._requiresCourseIds = raw.requiresCourses || [];
    this._requiredByIds = raw.requiredBy || [];
    this._lectureIds = raw.lectures || [];
    this._prerequisites = raw.prerequisites || [];
  }

  get succeededBy(): Course | undefined {
    if (!this._succeededById || !Course.allCourses) return undefined;
    return Course.allCourses.get(this._succeededById);
  }

  get organizations(): Organization[] {
    return this._organizationIds
      .map((id) => Organization.allOrganizations?.get(id))
      .filter((org): org is Organization => !!org);
  }

  get requiresCourses(): Course[] {
    return this._requiresCourseIds
      .map((id) => Course.allCourses?.get(id))
      .filter((course): course is Course => !!course);
  }

  get requiredBy(): Course[] {
    if (!Course.allCourses) return [];
    return this._requiredByIds.map((id) => Course.allCourses.get(id)).filter((course): course is Course => !!course);
  }

  get lectures(): Lecture[] {
    return this._lectureIds.map((id) => Lecture.allLectures.get(id)).filter((lecture): lecture is Lecture => !!lecture);
  }

  get prerequisites(): CoursePrerequisite[] {
    return this._prerequisites.map((p) => new CoursePrerequisite(p));
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      type: this.type,
      numberOfCredits: this.numberOfCredits,
      succeededBy: this._succeededById,
      codeMappings: this.codeMappings,
      prerequisites: this.prerequisites.map((p) => p.toJSON()),
      organizations: this._organizationIds,
      requiresCourses: this._requiresCourseIds,
      requiredBy: this._requiredByIds,
      lectures: this._lectureIds,
    };
  }
}
