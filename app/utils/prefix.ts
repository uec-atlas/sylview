const uaOrigin = "https://uec-atlas.org";

const getPrefixedTag =
  (prefix: string) =>
  (templateStrings: TemplateStringsArray, ...values: string[]) => {
    return templateStrings
      .reduce((result, str, i) => {
        return result + str + (values[i] || "");
      }, `${uaOrigin}/${prefix}`)
      .replace(/\/+/g, "/")
      .replace(":/", "://");
  };

export const uao = getPrefixedTag("ontology");
export const uar = getPrefixedTag("resources");
