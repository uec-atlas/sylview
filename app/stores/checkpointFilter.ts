const store = defineStore("checkpointFilter", () => {
  const orgId = useLocalStorage<string>("orgId", "");
  const entranceYear = useLocalStorage<number>("entranceYear", new Date().getFullYear());
  return {
    orgId,
    entranceYear,
  };
});

export const useCheckpointFilterRaw = () => store();
export const useCheckpointFilter = () => storeToRefs(store());
