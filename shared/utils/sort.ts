import type { I18NString } from "#shared/types/rdf";

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
  第一: 1,
  第二: 2,
  第三: 3,
  第四: 4,
  第五: 5,
  第六: 6,
  第七: 7,
  第八: 8,
  第九: 9,
  第十: 10,
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

export const compareByName = <T extends { name?: I18NString }>(a?: T, b?: T): number => {
  const nameA = a?.name?.ja || a?.name?.en || "";
  const nameB = b?.name?.ja || b?.name?.en || "";
  return compareJaString(nameA, nameB);
};

export const compareCheckpointType = <T extends { name?: I18NString }>(a: T, b: T): number => {
  const checkpoints = ["2年次終了時審査", "輪講履修条件", "卒業研究着手審査", "卒業所要単位", "修了所要単位"];
  const aKey = a.name?.ja.split("-").pop()?.trim() ?? "";
  const bKey = b.name?.ja.split("-").pop()?.trim() ?? "";
  return checkpoints.indexOf(aKey) - checkpoints.indexOf(bKey);
};
