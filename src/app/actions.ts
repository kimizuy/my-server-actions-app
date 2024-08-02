"use server";

import uFuzzy from "@leeoniya/ufuzzy";
import { ITEMS_COUNT, initialState, initialYears } from "./schema";
import videosJson from "./videos.json";

type FilterVideosState = typeof initialState;

export async function filterVideos(
  prevState: FilterVideosState,
  formData: FormData
): Promise<FilterVideosState> {
  const shouldLoadMore = formData.get("shouldLoadMore") === "true";

  if (shouldLoadMore) {
    return loadMore(prevState);
  }

  const keyword = formData.get("keyword")?.toString().trim() || "";
  const order = (formData.get("order")?.toString() as "asc" | "desc") || "desc";
  const years = initialYears.filter((year) => formData.has(year));

  const filteredVideosByYear = filterVideosByYear(videosJson, years);
  const searchedVideos = searchVideos(filteredVideosByYear, keyword);
  const sortedVideos = sortVideos(searchedVideos, order);
  const nextCursor =
    sortedVideos.length > ITEMS_COUNT ? sortedVideos[ITEMS_COUNT].id : null;
  const videos = sortedVideos.slice(0, ITEMS_COUNT);

  return {
    videos,
    keyword,
    order,
    years,
    nextCursor,
  };
}

type Video = (typeof videosJson)[number];

function filterVideosByYear(videos: Video[], years: string[]): Video[] {
  const result = videos.filter((video) =>
    years.includes(video.publishedAt.slice(0, 4))
  );
  return result;
}

function searchVideos(videos: Video[], keyword: string): Video[] {
  if (!keyword) return videos;
  const haystack = videos.map((v) => v.title);
  const uf = new uFuzzy({
    unicode: true,
    interSplit: "[^\\p{L}\\d']+",
    intraSplit: "\\p{Ll}\\p{Lu}",
    intraBound: "\\p{L}\\d|\\d\\p{L}|\\p{Ll}\\p{Lu}",
    intraChars: "[\\p{L}\\d']",
    intraContr: "'\\p{L}{1,2}\\b",
  });
  const idxs = uf.filter(haystack, keyword);
  const result = idxs?.map((i) => videos[i]) || [];
  return result;
}

function sortVideos(videos: Video[], order: "asc" | "desc"): Video[] {
  const result = order === "desc" ? videos : [...videos].reverse();
  return result;
}

function loadMore(prevState: FilterVideosState) {
  console.log("loadMore!");
  return prevState;
}
