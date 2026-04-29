import type { I18NString } from "#/shared/types/rdf";
import { BaseEntity } from "./BaseEntity";

export interface RawPerson {
  id: string;
  name?: I18NString;
}

export class Person extends BaseEntity {
  private static _allPeople: Map<string, Person> | null = null;
  static get allPeople(): Map<string, Person> {
    if (!Person._allPeople) Person._allPeople = new Map<string, Person>();
    return Person._allPeople;
  }

  constructor(raw: RawPerson) {
    super(raw.id, raw.name || { ja: "", en: "" });
  }

  override toJSON() {
    return {
      ...super.toJSON(),
    };
  }
}
