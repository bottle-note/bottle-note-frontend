export function clearSearchParams(
  params: URLSearchParams,
  keys: readonly string[],
) {
  keys.forEach((key) => params.delete(key));
}
