export function load({ data }) {
  if (data.isProduction && data.pathname !== '/') {
    throw new Error('Access denied');
  }

  return data;
}
