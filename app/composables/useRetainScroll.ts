/**
 * 特定の要素のスクロール位置をSessionStorageで保持・復元する
 * @param elRef スクロール対象のHTML要素のRef
 * @param storageKey ストレージに保存するための一意のキー
 */
export const useRetainScroll = (elRef: Ref<HTMLElement | null>, storageKey: string) => {
  const { y } = useScroll(elRef);
  const savedY = useSessionStorage<number>(storageKey, 0);

  onBeforeUnmount(() => {
    sessionStorage.setItem(storageKey, String(y.value));
  });

  onMounted(() => {
    nextTick(() => {
      if (elRef.value) {
        elRef.value.scrollTop = savedY.value;
      }
    });
  });

  return {
    currentY: y,
    savedY,
  };
};
