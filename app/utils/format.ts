export const formatCategoryName = (category?: CourseCategory): string[] => {
  if (!category) return [];
  return [...ancestors(category, (cat) => cat.subCategoryOf)].reverse().map((cat) => cat.name.ja);
};

export const formatOrganizationName = (organization?: Organization): string[] => {
  if (!organization) return [];
  const items = [
    ...ancestors(organization, (org) => {
      const next = org.subOrganizationOf[0];
      if (!next || next.type === "University") return null;
      if (next.type === "Department") return next.subOrganizationOf[0];
      return next;
    }),
  ]
    .reverse()
    .map((org) => org.name.ja);
  return items;
};
