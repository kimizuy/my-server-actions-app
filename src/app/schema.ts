import videosJson from "./videos.json";

export const ITEMS_COUNT = 10;

export const years = Array.from(
  new Set(videosJson.map((video) => video.publishedAt.slice(0, 4)))
);

export const initialState = {
  videos: videosJson.slice(0, ITEMS_COUNT),
  keyword: "",
  order: "desc",
  years,
  cursor: videosJson[ITEMS_COUNT - 1].id || null,
  canReadMore: true,
};
