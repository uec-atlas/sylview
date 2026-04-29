import type { I18NString } from "#/shared/types/rdf";
import { BaseEntity } from "./BaseEntity";
import { Course } from "./Course";
import { CourseCategory } from "./CourseCategory";
import { Organization } from "./Organization";

export interface RawCategoryRequirement {
  targetCategories?: string[];
  minCredits?: number;
  description?: string;
}

export interface CategoryRequirement {
  targetCategories: Set<CourseCategory>;
  minCredits?: number;
  description?: string;
}

export interface RawCheckpoint {
  id: string;
  type: "Checkpoint";
  name: I18NString;
  year?: number;
  targetOrganization?: string;
  targetGrades?: number[];
  courseRequirements?: string[];
  categoryRequirements?: RawCategoryRequirement[];
}

export class Checkpoint extends BaseEntity {
  type: "Checkpoint" = "Checkpoint";
  year?: number;
  private _targetOrganizationId?: string;
  targetGrades: number[] = [];
  private _courseRequirementIds: string[] = [];
  private _categoryRequirements: RawCategoryRequirement[] = [];

  private static _allCheckpoints: Map<string, Checkpoint> | null = null;
  static get allCheckpoints(): Map<string, Checkpoint> {
    if (!Checkpoint._allCheckpoints) Checkpoint._allCheckpoints = new Map<string, Checkpoint>();
    return Checkpoint._allCheckpoints;
  }

  constructor(raw: RawCheckpoint) {
    super(raw.id, raw.name);
    this.year = raw.year;
    this._targetOrganizationId = raw.targetOrganization;
    this.targetGrades = raw.targetGrades || [];
    this._courseRequirementIds = raw.courseRequirements || [];
    this._categoryRequirements = (raw.categoryRequirements || []).map((req) => ({
      targetCategories: Array.isArray(req.targetCategories) ? req.targetCategories : [],
      minCredits: req.minCredits,
      description: req.description,
    }));
  }

  get targetOrganization(): Organization | undefined {
    if (!this._targetOrganizationId) return undefined;
    return Organization.allOrganizations.get(this._targetOrganizationId);
  }

  get courseRequirements(): Course[] {
    return this._courseRequirementIds
      .map((id) => Course.allCourses.get(id))
      .filter((course): course is Course => !!course);
  }

  get categoryRequirements(): CategoryRequirement[] {
    return this._categoryRequirements.map((r) => ({
      targetCategories: new Set(
        Array.from(r.targetCategories || [])
          .map((id) => CourseCategory.allCategories.get(id as unknown as string))
          .filter((cat): cat is CourseCategory => !!cat),
      ),
      minCredits: r.minCredits,
      description: r.description,
    }));
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      type: this.type,
      year: this.year,
      targetOrganization: this._targetOrganizationId,
      targetGrades: this.targetGrades,
      courseRequirements: this._courseRequirementIds,
      categoryRequirements: this._categoryRequirements,
    };
  }
}
