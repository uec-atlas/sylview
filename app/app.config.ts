export default defineAppConfig({
  ui: {
    colors: {
      primary: "brand",
    },
    pageCard: {
      defaultVariants: {
        variant: "subtle",
      },
      compoundVariants: [
        {
          class: {
            wrapper: "flex-row gap-4",
            leading: "mb-0",
            leadingIcon: "mt-0.5",
          },
        },
      ],
    },
    link: {
      base: "underline underline-offset-2",
    },
  },
});
