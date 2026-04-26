import type { Organization } from "~/composables/useOrganizationData";
import type { I18NString } from "~/types/rdf";

export interface RawPerson {
  id: string;
  name?: I18NString;
  alternateNames?: Record<string, unknown>;
  memberOf?: string[];
  isBasedOn?: string | null;
  isPartTime?: boolean;
}

export interface Person {
  id: string;
  name?: I18NString;
  alternateNames?: Record<string, unknown>;
  memberOf: Set<Organization>;
  isBasedOn?: string | null;
  isPartTime?: boolean;
}

let peopleCache: RawPerson[] | null = null;

const fetchPeople = async () => {
  if (peopleCache) {
    return peopleCache;
  }

  const response = await $fetch<{ items: RawPerson[] }>(uar`/people/all`);
  const items = response.items || [];

  peopleCache = items;

  return items;
};

export const usePeopleData = () => {
  const organizations = useOrganizationData();

  return useAsyncData("people", fetchPeople, {
    default: () => new Map<string, Person>(),
    watch: [organizations.data],
    deep: false,
    dedupe: "defer",
    transform: (items) => {
      const people = new Map<string, Person>();
      for (const rawPerson of items) {
        people.set(rawPerson.id, {
          id: rawPerson.id,
          name: rawPerson.name,
          alternateNames: rawPerson.alternateNames,
          memberOf: new Set(),
          isBasedOn: rawPerson.isBasedOn,
          isPartTime: rawPerson.isPartTime,
        });
      }

      const organizationMap = organizations.data.value || new Map<string, Organization>();
      for (const rawPerson of items) {
        const person = people.get(rawPerson.id);
        if (!person) {
          continue;
        }

        for (const organizationId of rawPerson.memberOf || []) {
          const organization = organizationMap.get(organizationId);
          if (organization) {
            person.memberOf.add(organization);
          }
        }
      }

      return people;
    },
  });
};
