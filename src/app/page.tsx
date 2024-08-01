import { Form } from "./form";

export default async function Home() {
  return (
    <main className="grid p-24 min-h-screen">
      <div>
        <h1>my-server-actions-app</h1>
        <div className="mt-16">
          <Form />
        </div>
      </div>
    </main>
  );
}
