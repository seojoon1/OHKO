import { Link } from "react-router";

import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "OHKO" }];
}

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">OHKO</h1>
        <Link to="/ranking" className="text-sm text-blue-600">
          사용률 순위 →
        </Link>
      </div>
    </main>
  );
}
