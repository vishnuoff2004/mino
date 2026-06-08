export const tl = (obj, field) => {
  if (!obj) return '';
  return obj[field];
};
