import type { I18NString } from "#/shared/types/rdf";

const replaceMap = {
  Ⅰ: 1,
  Ⅱ: 2,
  Ⅲ: 3,
  Ⅳ: 4,
  Ⅴ: 5,
  Ⅵ: 6,
  Ⅶ: 7,
  Ⅷ: 8,
  Ⅸ: 9,
  Ⅹ: 10,
  Ⅺ: 11,
  Ⅻ: 12,
  前期: 1,
  後期: 2,
};

const collator = new Intl.Collator("ja", {
  numeric: true,
});

export const compareJaString = (a: string = "", b: string = ""): number => {
  for (const [from, to] of Object.entries(replaceMap)) {
    a = a.replaceAll(from, to.toString());
    b = b.replaceAll(from, to.toString());
  }
  return collator.compare(a, b);
};

export const sortByName = <T extends { name?: I18NString }>(a: T, b: T): number => {
  const nameA = a.name?.ja || a.name?.en || "";
  const nameB = b.name?.ja || b.name?.en || "";
  return compareJaString(nameA, nameB);
};
