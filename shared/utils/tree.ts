export function* ancestors<T>(
  node: T | null | undefined,
  getParent: (item: T) => T | null | undefined,
): IterableIterator<T> {
  let current = node;
  while (current) {
    yield current;
    current = getParent(current);
  }
}
