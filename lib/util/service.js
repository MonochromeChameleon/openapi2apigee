export function servicesToArray (api) {
  if (!api['x-a127-services']) {
    return [];
  }

  if (Array.isArray(api['x-a127-services'])) {
    return api['x-a127-services']
  }

  return Object.entries(api['x-a127-services']).map(([key, value]) => ({ name: key, ...value }));
}
