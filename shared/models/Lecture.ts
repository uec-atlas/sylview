import type { I18NString } from "#shared/types/rdf";
import { BaseEntity } from "./BaseEntity";
import { Course } from "./Course";
import { Person } from "./Person";

export interface RawLecture {
  id: string;
  type: "Lecture";
  name: I18NString;
  year: number;
  sourceUrl?: string;
  instructors?: string[];
  term?: string;
  periods?: string[];
  timeTableCode?: string;
  numberOfCredits?: number;
  targetGrades?: number[];
  courses?: string[];
}

export class Lecture extends BaseEntity {
  type: "Lecture" = "Lecture";
  year: number;
  sourceUrl?: string;
  private _instructorIds: string[] = [];
  term?: string;
  periods: string[] = [];
  timeTableCode?: string;
  numberOfCredits?: number;
  targetGrades: number[] = [];
  private _courseIds: string[] = [];
  private static _allLectures: Map<string, Lecture> | null = null;
  static get allLectures(): Map<string, Lecture> {
    if (!Lecture._allLectures) Lecture._allLectures = new Map<string, Lecture>();
    return Lecture._allLectures;
  }

  constructor(raw: RawLecture) {
    super(raw.id, raw.name);
    this.year = raw.year;
    this.sourceUrl = raw.sourceUrl;
    this._instructorIds = raw.instructors || [];
    this.term = raw.term;
    this.periods = raw.periods || [];
    this.timeTableCode = raw.timeTableCode;
    this.numberOfCredits = raw.numberOfCredits;
    this.targetGrades = raw.targetGrades || [];
    this._courseIds = raw.courses || [];
  }

  get instructors(): Person[] {
    return this._instructorIds.map((id) => Person.allPeople.get(id)).filter((person): person is Person => !!person);
  }

  get courses(): Course[] {
    return this._courseIds.map((id) => Course.allCourses.get(id)).filter((course): course is Course => !!course);
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      type: this.type,
      year: this.year,
      sourceUrl: this.sourceUrl,
      instructors: this._instructorIds,
      term: this.term,
      periods: this.periods,
      timeTableCode: this.timeTableCode,
      numberOfCredits: this.numberOfCredits,
      targetGrades: this.targetGrades,
      courses: this._courseIds,
    };
  }
}
