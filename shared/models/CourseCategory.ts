import type { I18NString } from "#/shared/types/rdf";
import { BaseEntity } from "./BaseEntity";

export interface RawCourseCategory {
  id: string;
  type: "CourseCategory";
  name: I18NString;
  subCategoryOf?: string;
  hasSubCategory?: string[];
}

export class CourseCategory extends BaseEntity {
  type: "CourseCategory" = "CourseCategory";
  private _subCategoryOfId?: string;
  private _hasSubCategoryIds: string[] = [];

  private static _allCategories: Map<string, CourseCategory> | null = null;
  static get allCategories(): Map<string, CourseCategory> {
    if (!CourseCategory._allCategories) CourseCategory._allCategories = new Map<string, CourseCategory>();
    return CourseCategory._allCategories;
  }

  constructor(raw: RawCourseCategory) {
    super(raw.id, raw.name);
    this._subCategoryOfId = raw.subCategoryOf;
    this._hasSubCategoryIds = raw.hasSubCategory || [];
  }

  get subCategoryOf(): CourseCategory | undefined {
    if (!this._subCategoryOfId) return undefined;
    return CourseCategory.allCategories.get(this._subCategoryOfId);
  }

  get hasSubCategory(): CourseCategory[] {
    return this._hasSubCategoryIds
      .map((id) => CourseCategory.allCategories?.get(id))
      .filter((cat): cat is CourseCategory => !!cat);
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      type: this.type,
      subCategoryOf: this._subCategoryOfId,
      hasSubCategory: this._hasSubCategoryIds,
    };
  }
}
