import type { NavigationMenuItem } from "@nuxt/ui";

export const useNavItems = () => {
  const route = useRoute();

  const navItems: NavigationMenuItem[] = [
    {
      label: "科目検索",
      icon: "mdi:magnify",
      to: "/lectures",
      active: route.path.startsWith("/lectures"),
    },
    {
      label: "進級審査",
      icon: "mdi:clipboard-check-outline",
      to: "/checkpoints",
      active: route.path.startsWith("/checkpoints"),
    },
  ];

  return navItems;
};
