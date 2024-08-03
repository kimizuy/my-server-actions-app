"use server";

import uFuzzy from "@leeoniya/ufuzzy";
import { ITEMS_COUNT, initialState } from "./schema";
import videosJson from "./videos.json";

type FilterVideosState = typeof initialState;

export async function filterVideos(
  prevState: FilterVideosState,
  formData: FormData
): Promise<FilterVideosState> {
  const shouldLoadMore = formData.get("shouldLoadMore") === "true";

  if (shouldLoadMore) {
    const moreVideos = loadMoreVideos(videosJson, prevState);
    return moreVideos;
  }

  const keyword = formData.get("keyword")?.toString().trim() || "";
  const order = (formData.get("order")?.toString() as "asc" | "desc") || "desc";
  const years = formData.getAll("year").map((year) => year.toString());

  const filteredVideosByYear = filterVideosByYear(videosJson, years);
  const searchedVideos = searchVideos(filteredVideosByYear, keyword);
  const sortedVideos = sortVideos(searchedVideos, order);
  const nextCursor =
    sortedVideos.length > ITEMS_COUNT ? sortedVideos[ITEMS_COUNT - 1].id : null;
  const videos = sortedVideos.slice(0, ITEMS_COUNT);
  const itemCount = sortedVideos.length;

  return {
    videos,
    keyword,
    order,
    years,
    nextCursor,
    itemCount,
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

function sortVideos(videos: Video[], order: string): Video[] {
  const result = order === "desc" ? videos : [...videos].reverse();
  return result;
}

function loadMoreVideos(videos: Video[], prevState: FilterVideosState) {
  const filteredVideosByYear = filterVideosByYear(videos, prevState.years);
  const searchedVideos = searchVideos(filteredVideosByYear, prevState.keyword);
  const sortedVideos = sortVideos(searchedVideos, prevState.order);
  const nextCursorIndex = sortedVideos.findIndex(
    (v) => v.id === prevState.nextCursor
  );
  const nextVideos = sortedVideos.slice(
    nextCursorIndex + 1,
    nextCursorIndex + 1 + ITEMS_COUNT
  );
  const newVideos = [...prevState.videos, ...nextVideos];
  const newNextCursor =
    sortedVideos.length > newVideos.length
      ? sortedVideos[newVideos.length - 1].id
      : null;
  const newItemCount = sortedVideos.length;

  return {
    ...prevState,
    videos: newVideos,
    nextCursor: newNextCursor,
    itemCount: newItemCount,
  };
}
