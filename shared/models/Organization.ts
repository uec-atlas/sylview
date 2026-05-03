import type { I18NString } from "#shared/types/rdf";
import { BaseEntity } from "./BaseEntity";

export interface RawOrganization {
  id: string;
  type: string;
  name: I18NString;
  subOrganizationOf?: string[];
  hasSubOrganization?: string[];
}

export class Organization extends BaseEntity {
  type: string;
  private _subOrganizationOfIds: string[] = [];
  private _hasSubOrganizationIds: string[] = [];

  private static _allOrganizations: Map<string, Organization> | null = null;
  static get allOrganizations(): Map<string, Organization> {
    if (!Organization._allOrganizations) {
      Organization._allOrganizations = new Map<string, Organization>();
    }
    return Organization._allOrganizations;
  }

  constructor(raw: RawOrganization) {
    super(raw.id, raw.name);
    this.type = raw.type;
    this._subOrganizationOfIds = raw.subOrganizationOf || [];
    this._hasSubOrganizationIds = raw.hasSubOrganization || [];
  }

  get subOrganizationOf(): Organization[] {
    return this._subOrganizationOfIds
      .map((id) => Organization.allOrganizations?.get(id))
      .filter((org): org is Organization => !!org);
  }

  get hasSubOrganization(): Organization[] {
    return this._hasSubOrganizationIds
      .map((id) => Organization.allOrganizations?.get(id))
      .filter((org): org is Organization => !!org);
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      type: this.type,
      subOrganizationOf: this._subOrganizationOfIds,
      hasSubOrganization: this._hasSubOrganizationIds,
    };
  }
}
