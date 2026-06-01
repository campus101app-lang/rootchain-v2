/** Ensure upload URLs load on HTTPS pages (fixes mixed-content from API). */
export function resolveAssetUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url.replace(/^http:\/\//i, "https://");
}
