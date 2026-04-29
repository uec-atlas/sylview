import type { CourseCategory } from "#shared/models/CourseCategory";
import type { Organization } from "#shared/models/Organization";

export const formatI18nText = (name?: { ja?: string; en?: string }, fallback = ""): string => {
  return name?.ja || name?.en || fallback;
};

export const formatCategoryName = (category?: CourseCategory): string[] => {
  if (!category) return [];
  return [...ancestors(category, (cat) => cat.subCategoryOf)].reverse().map((cat) => formatI18nText(cat.name, cat.id));
};

export const formatOrganizationName = (organization?: Organization): string[] => {
  if (!organization) return [];

  const getParent = (org: Organization): Organization | null => {
    const parents = Array.isArray((org as { subOrganizationOf?: unknown }).subOrganizationOf)
      ? (org as { subOrganizationOf: Organization[] }).subOrganizationOf
      : [];
    const next = parents[0];
    if (!next || next.type === "University") return null;
    if (next.type === "Department") {
      const departmentParents = Array.isArray((next as { subOrganizationOf?: unknown }).subOrganizationOf)
        ? (next as { subOrganizationOf: Organization[] }).subOrganizationOf
        : [];
      return departmentParents[0] ?? null;
    }
    return next;
  };

  const items = [...ancestors(organization, getParent)]
    .reverse()
    .map((org) => org.name?.ja)
    .filter((name): name is string => !!name);
  return items;
};
