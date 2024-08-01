"use server";

import uFuzzy from "@leeoniya/ufuzzy";
import { ITEMS_COUNT, initialState, initialYears } from "./schema";
import videosJson from "./videos.json";

type FilterVideosState = typeof initialState;

const uf = new uFuzzy({
  unicode: true,
  interSplit: "[^\\p{L}\\d']+",
  intraSplit: "\\p{Ll}\\p{Lu}",
  intraBound: "\\p{L}\\d|\\d\\p{L}|\\p{Ll}\\p{Lu}",
  intraChars: "[\\p{L}\\d']",
  intraContr: "'\\p{L}{1,2}\\b",
});

export async function filterVideos(
  prevState: FilterVideosState,
  formData: FormData
): Promise<FilterVideosState> {
  const keyword = formData.get("keyword")?.toString().trim() || "";
  const order = formData.get("order")?.toString() || "desc";
  const years = initialYears.filter((year) => formData.has(year));

  const searchedVideos = (() => {
    if (!keyword) return videosJson;
    const haystack = videosJson.map((v) => v.title);
    const idxs = uf.filter(haystack, keyword || "");
    const result = idxs?.map((i) => videosJson[i]);
    if (!result || result.length === 0) return [];
    return result;
  })();

  // if (readMore) {
  //   console.log("readMore!");

  //   const cursor = prevState.cursor;
  //   console.log("cursor", cursor);

  //   if (!cursor) return prevState;

  //   const startIndex =
  //     searchedVideos.findIndex((video) => video.id === cursor) + 1;
  //   console.log("startIndex", startIndex);

  //   const slicedVideos = searchedVideos.slice(
  //     startIndex,
  //     startIndex + ITEMS_COUNT
  //   );
  //   console.log("slicedVideos", slicedVideos);

  //   return {
  //     ...prevState,
  //     videos: [...prevState.videos, ...slicedVideos],
  //     cursor: slicedVideos.length
  //       ? slicedVideos[slicedVideos.length - 1].id
  //       : null,
  //     canReadMore: searchedVideos.length > startIndex + ITEMS_COUNT,
  //   };
  // }

  const filteredVideos = searchedVideos.filter((video) => {
    const matchesYear = years.includes(video.publishedAt.slice(0, 4));
    return matchesYear;
  });

  const sortedVideos =
    order === "desc" ? filteredVideos : [...filteredVideos].reverse();

  const nextCursor =
    sortedVideos.length > 0 ? sortedVideos[ITEMS_COUNT].id : null;

  return {
    videos: sortedVideos.slice(0, ITEMS_COUNT),
    keyword,
    order,
    years,
    nextCursor,
  };
}
