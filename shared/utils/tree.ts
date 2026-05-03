export function* ancestors<T>(
  node: T | null | undefined,
  getParent: (item: T) => T | null | undefined,
): IterableIterator<T> {
  if (!node) return;
  let current = getParent(node);
  while (current) {
    yield current;
    current = getParent(current);
  }
}

export function* descendantsDFS<T>(
  node: T | null | undefined,
  getChildren: (item: T) => T[] | null | undefined,
): IterableIterator<T> {
  if (!node) return;
  const stack: T[] = [...(getChildren(node) ?? [])];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    yield current;
    const children = getChildren(current);
    if (children) {
      stack.push(...children);
    }
  }
}

export function* descendantsBFS<T>(
  node: T | null | undefined,
  getChildren: (item: T) => T[] | null | undefined,
): IterableIterator<T> {
  if (!node) return;
  const queue: T[] = [...(getChildren(node) ?? [])];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    yield current;
    const children = getChildren(current);
    if (children) {
      queue.push(...children);
    }
  }
}
