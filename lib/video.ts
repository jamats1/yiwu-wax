/**
 * Converts a YouTube or Vimeo share/watch URL into an embed URL.
 * Returns null if the URL is not a recognised video platform.
 */
export function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;

  try {
    const u = new URL(url);

    // YouTube: https://www.youtube.com/watch?v=ID
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      const id = u.searchParams.get("v");
      return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
    }

    // YouTube short: https://youtu.be/ID
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
    }

    // YouTube Shorts: https://www.youtube.com/shorts/ID
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/shorts/")) {
      const id = u.pathname.replace("/shorts/", "");
      return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
    }

    // Vimeo: https://vimeo.com/ID
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0`;
    }
  } catch {
    return null;
  }

  return null;
}
