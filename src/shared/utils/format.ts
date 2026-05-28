export function formatarData(data: string) {
  if (!/^\d{8}$/.test(data)) return null;

  const [dd, mm, yyyy] = [data.slice(0, 2), data.slice(2, 4), data.slice(4, 8)];

  return `${yyyy}-${mm}-${dd}`;
}
