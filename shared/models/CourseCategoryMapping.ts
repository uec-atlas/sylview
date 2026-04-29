import type { I18NString } from "#/shared/types/rdf";
import { BaseEntity } from "./BaseEntity";
import { Course } from "./Course";
import { CourseCategory } from "./CourseCategory";
import { Organization } from "./Organization";

export interface RawCourseCategoryMapping {
  id: string;
  type: "CourseCategoryMapping";
  name: I18NString;
  year?: number;
  targetOrganization?: string;
  targetGrades?: number[];
  category: string;
  courses?: string[];
}

export class CourseCategoryMapping extends BaseEntity {
  type: "CourseCategoryMapping" = "CourseCategoryMapping";
  year?: number;
  private _targetOrganizationId?: string;
  targetGrades: number[] = [];
  private _categoryId: string;
  private _courseIds: string[] = [];

  private static _allMappings: Map<string, CourseCategoryMapping> | null = null;
  static get allMappings(): Map<string, CourseCategoryMapping> {
    if (!CourseCategoryMapping._allMappings)
      CourseCategoryMapping._allMappings = new Map<string, CourseCategoryMapping>();
    return CourseCategoryMapping._allMappings;
  }

  constructor(raw: RawCourseCategoryMapping) {
    super(raw.id, raw.name);
    this.year = raw.year;
    this._targetOrganizationId = raw.targetOrganization;
    this.targetGrades = raw.targetGrades || [];
    this._categoryId = raw.category;
    this._courseIds = raw.courses || [];
  }

  get targetOrganization(): Organization | undefined {
    if (!this._targetOrganizationId) return undefined;
    return Organization.allOrganizations.get(this._targetOrganizationId);
  }

  get category(): CourseCategory {
    return CourseCategory.allCategories.get(this._categoryId) || ({} as CourseCategory);
  }

  get courses(): Course[] {
    return this._courseIds.map((id) => Course.allCourses.get(id)).filter((course): course is Course => !!course);
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      type: this.type,
      year: this.year,
      targetOrganization: this._targetOrganizationId,
      targetGrades: this.targetGrades,
      category: this._categoryId,
      courses: this._courseIds,
    };
  }
}
