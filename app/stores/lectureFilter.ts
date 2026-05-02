const store = defineStore("lectureFilter", () => {
  const search = useRouteQuery<string>("q", "");
  const terms = useRouteQuery<string, string[]>("terms", "", {
    transform: {
      get: (val) => (val ? val.split(",") : []),
      set: (val) => val.join(","),
    },
  });
  const periods = useRouteQuery<string, string[]>("periods", "", {
    transform: {
      get: (val) => (val ? val.split(",") : []),
      set: (val) => val.join(","),
    },
  });

  const reset = () => {
    search.value = "";
    terms.value = [];
    periods.value = [];
  };

  return {
    search,
    terms,
    periods,
    reset,
  };
});

export const useLectureFilterRaw = () => store();
export const useLectureFilter = () => storeToRefs(store());
