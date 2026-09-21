export function postgresUrl(url?: string): string {
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }

  const parsed = new URL(url);
  parsed.searchParams.delete('schema');
  return parsed.toString();
}
