import uFuzzy from "@leeoniya/ufuzzy";
import videosJson from "./videos.json";

const uf = new uFuzzy({
  unicode: true,
  interSplit: "[^\\p{L}\\d']+",
  intraSplit: "\\p{Ll}\\p{Lu}",
  intraBound: "\\p{L}\\d|\\d\\p{L}|\\p{Ll}\\p{Lu}",
  intraChars: "[\\p{L}\\d']",
  intraContr: "'\\p{L}{1,2}\\b",
});

export const QUERIES = ["year", "keyword", "order", "cursor"] as const;
const ITEMS_COUNT = 100;

export type Video = (typeof videosJson)[number];
export type Queries = Partial<Record<(typeof QUERIES)[number], string>>;
export type Result = {
  videos: Video[];
  nextCursor: string | null;
};

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const { keyword, order, cursor } = Object.fromEntries(
    QUERIES.map((key) => [key, searchParams.get(key)])
  );
  const years = searchParams.getAll("year");

  let filteredVideos = videosJson;

  if (years.length) {
    filteredVideos = filteredVideos.filter((video) =>
      years.includes(video.publishedAt.slice(0, 4))
    );
  }

  if (keyword) {
    const decoded = decodeURIComponent(keyword);
    const haystack = filteredVideos?.map((v) => `${v.title}¦${v.description}`);
    const idxs = uf.filter(haystack, decoded);
    if (idxs) {
      filteredVideos = idxs.map((idx) => filteredVideos[idx]);
    }
  }

  const startIndex = cursor
    ? filteredVideos.findIndex((video) => video.id === cursor) + 1
    : 0;
  filteredVideos = filteredVideos.slice(startIndex, startIndex + ITEMS_COUNT);

  if (order === "asc") {
    filteredVideos = filteredVideos.reverse();
  }

  const nextCursor =
    startIndex + ITEMS_COUNT < filteredVideos.length
      ? filteredVideos[filteredVideos.length - 1].id
      : null;

  return Response.json({ videos: filteredVideos, nextCursor });
}
