import { Form } from "./form";

export default async function Home() {
  return (
    <main className="grid place-items-center p-24 min-h-screen">
      <div className="grid gap-16">
        <h1>videos-infinite-scroll-app</h1>
        <Form />
      </div>
    </main>
  );
}
