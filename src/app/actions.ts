import uFuzzy from "@leeoniya/ufuzzy";
import videosJson from "./api/videos/videos.json";

const ITEMS_COUNT = 3;

export const years = Array.from(
  new Set(videosJson.map((video) => video.publishedAt.slice(0, 4)))
);

export const initialState = {
  videos: videosJson.slice(0, ITEMS_COUNT),
  formData: {
    keyword: "",
    order: "desc",
    years,
    cursor: videosJson[ITEMS_COUNT - 1].id || null,
  },
};

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
  const keyword = formData.get("keyword") as string | null;
  const order = formData.get("order") as string | null;
  const selectedYears = years.filter((year) => formData.has(year));

  let filteredVideos = videosJson;

  const hasOrderChanged = order !== prevState.formData.order;
  const hasYearsChanged = !(
    selectedYears.length === prevState.formData.years.length &&
    JSON.stringify(selectedYears) === JSON.stringify(prevState.formData.years)
  );
  const hasKeywordChanged = keyword !== prevState.formData.keyword;
  const hasFormDataChanged =
    hasOrderChanged || hasYearsChanged || hasKeywordChanged;

  if (!hasFormDataChanged) {
    return prevState;
  }

  if (hasOrderChanged) {
    filteredVideos = filteredVideos.reverse();
  }

  filteredVideos = filteredVideos.filter((video) =>
    selectedYears.includes(video.publishedAt.slice(0, 4))
  );

  if (keyword) {
    const decoded = decodeURIComponent(keyword || "");
    const haystack = filteredVideos?.map((v) => `${v.title}¦${v.description}`);
    const idxs = uf.filter(haystack, decoded);
    if (idxs) {
      filteredVideos = idxs.map((idx) => filteredVideos[idx]);
    }
  }

  const cursor = prevState.videos.length
    ? prevState.videos[prevState.videos.length - 1].id
    : null;
  const startIndex = cursor
    ? filteredVideos.findIndex((video) => video.id === cursor) + 1
    : 0;
  filteredVideos = filteredVideos.slice(0, startIndex + ITEMS_COUNT);
  // filteredVideos = filteredVideos.slice(0, ITEMS_COUNT);

  return {
    videos: filteredVideos,
    formData: {
      keyword: keyword || prevState.formData.keyword,
      order: order || prevState.formData.order,
      years: selectedYears,
      cursor: filteredVideos.length
        ? filteredVideos[filteredVideos.length - 1].id
        : null,
    },
  };
}
