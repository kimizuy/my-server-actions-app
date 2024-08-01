"use client";

import { filterVideos } from "./actions";
import { useFormState, useFormStatus } from "react-dom";
import { initialState, initialYears } from "./schema";
import { ComponentProps, useState } from "react";

export function Form() {
  const [state, formAction] = useFormState(filterVideos, initialState);
  // const [readMore, setReadMore] = useState(false);
  console.log("keyword", state.keyword);

  return (
    <div className="flex gap-8">
      <div className="w-64">
        <form id="search" action={formAction} className="grid gap-4">
          <div className="flex gap-2">
            {initialYears.map((year) => (
              <label key={year}>
                <input type="checkbox" name={year} defaultChecked />
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
          {/* <input
            type="hidden"
            name="readMore"
            value={readMore ? "true" : "false"}
          /> */}
          <SubmitButton>検索</SubmitButton>
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
