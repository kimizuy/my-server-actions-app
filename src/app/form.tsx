"use client";

import { filterVideos } from "./actions";
import { useFormState, useFormStatus } from "react-dom";
import { initialState, initialYears } from "./schema";
import { ComponentProps, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function Form() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction] = useFormState(filterVideos, initialState);
  const [isInitial, setIsInitial] = useState(true);
  const [shouldLoadMore, setShouldLoadMore] = useState(false);
  const keyword = searchParams.get("keyword");
  const order = searchParams.get("order");
  const years = searchParams.getAll("year");

  useEffect(
    function initialRender() {
      if (!isInitial) return;
      const formData = new FormData();
      if (keyword) formData.set("keyword", keyword);
      if (order) formData.set("order", order);
      years.forEach((year) => {
        formData.append("year", year);
      });
      formAction(formData);
      setIsInitial(false);
    },
    [formAction, isInitial, keyword, order, years]
  );

  function updateSearchParams(formData: FormData) {
    const newKeyword = formData.get("keyword");
    const newOrder = formData.get("order");
    const newYears = formData.getAll("year").map((year) => year.toString());
    const newParams = new URLSearchParams();
    if (newKeyword) newParams.set("keyword", newKeyword.toString());
    if (newOrder) newParams.set("order", newOrder.toString());
    newYears.forEach((year) => {
      newParams.append("year", year);
    });
    if (shouldLoadMore) newParams.set("shouldLoadMore", "true");
    router.replace("?" + newParams.toString());
  }

  return (
    <div className="flex gap-8">
      <div className="w-64">
        <form
          id="search"
          action={(formData) => {
            formAction(formData);
            updateSearchParams(formData);
          }}
          className="grid gap-4"
        >
          <div className="flex gap-2">
            {initialYears.map((year) => (
              <label key={year}>
                <input
                  type="checkbox"
                  name="year"
                  value={year}
                  defaultChecked
                />
                {year}
              </label>
            ))}
          </div>

          <div>
            <label className="flex gap-2">
              <span>キーワード</span>
              <input type="text" name="keyword" className="text-black" />
            </label>
          </div>

          <div>
            <label className="flex gap-2">
              <span>並び順</span>
              <select name="order" defaultValue="desc" className="text-black">
                <option value="desc">降順</option>
                <option value="asc">昇順</option>
              </select>
            </label>
          </div>
          <input
            type="hidden"
            name="shouldLoadMore"
            value={shouldLoadMore.toString()}
          />
          <SubmitButton
            onClick={() => {
              setShouldLoadMore(false);
            }}
          >
            検索
          </SubmitButton>
        </form>
      </div>

      <div className="flex-1">
        <ul className="grid gap-4">
          {state.videos.map((video, i) => (
            <li key={video.id}>
              <p className="flex gap-2">
                <span className="font-bold">{i + 1}</span>
                <span>{video.publishedAt}</span>
              </p>
              <h2>{video.title}</h2>
            </li>
          ))}
        </ul>

        {state.nextCursor ? (
          <SubmitButton
            form="search"
            className="mt-12"
            onClick={() => {
              setShouldLoadMore(true);
            }}
          >
            もっと見る
          </SubmitButton>
        ) : null}
      </div>
    </div>
  );
}

type SubmitButtonProps = { children: string } & Omit<
  ComponentProps<"button">,
  "children" | "type" | "disabled"
>;

function SubmitButton({ children, ...rest }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button {...rest} type="submit" disabled={pending}>
      {children}
    </button>
  );
}
