import type { I18NString } from "#shared/types/rdf";

export abstract class BaseEntity {
  id: string;
  name: I18NString;

  constructor(id: string, name: I18NString) {
    this.id = id;
    this.name = name;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
    };
  }
}
