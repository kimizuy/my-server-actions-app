"use client";

// import { initialState, years } from "./schema";
import { filterVideos, initialState, years } from "./actions";
import { useFormState } from "react-dom";

export function Form() {
  const [state, formAction] = useFormState(filterVideos, initialState);

  return (
    <div className="flex gap-8">
      <div>
        <form action={formAction} className="grid gap-4">
          <div className="flex gap-2">
            {years.map((year) => (
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

          <button type="submit" onClick={() => console.log("onclick!")}>
            検索
          </button>
        </form>
      </div>

      <ul className="grid gap-4">
        {state?.videos.map((video, i) => (
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
  );
}
