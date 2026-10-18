const youtubeHosts = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);

export const SHADOWING_SEARCH_URL =
  "https://www.youtube.com/results?search_query=IELTS%20shadowing%20English%20speaking";

export function isYouTubeLink(value: string): boolean {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:" && youtubeHosts.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}
