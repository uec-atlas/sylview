import type { I18NString } from "~/types/rdf";

export interface Organization {
  id: string;
  type: string;
  name: I18NString;
  subOrganizationOf: Organization[];
  hasSubOrganization: Organization[];
}

interface RawOrganization {
  id: string;
  type: string;
  name: I18NString;
  subOrganizationOf?: string[];
  hasSubOrganization?: string[];
}

let organizationsCache: RawOrganization[] | null = null;

const fetchOrganizations = async () => {
  if (organizationsCache) {
    return organizationsCache;
  }

  const response = await $fetch<{ items: RawOrganization[] }>(uar`/organizations/all`);
  const items = response.items || [];

  organizationsCache = items;

  return items;
};

export const useOrganizationData = () =>
  useAsyncData("organizations", fetchOrganizations, {
    default: () => new Map<string, Organization>(),
    deep: false,
    dedupe: "defer",
    transform: (items) => {
      const organizations = new Map<string, Organization>();
      for (const org of items) {
        organizations.set(org.id, {
          id: org.id,
          type: org.type,
          name: org.name,
          subOrganizationOf: [],
          hasSubOrganization: [],
        });
      }
      for (const org of items) {
        const currentOrg = organizations.get(org.id);
        if (!currentOrg) continue;
        if (org.subOrganizationOf) {
          for (const parentId of org.subOrganizationOf) {
            const parentOrg = organizations.get(parentId);
            if (parentOrg) {
              currentOrg.subOrganizationOf.push(parentOrg);
              parentOrg.hasSubOrganization.push(currentOrg);
            }
          }
        }
      }
      return organizations;
    },
  });
