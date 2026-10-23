import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "OHKO" }];
}

export default function Home() {
  return <main>OHKO</main>;
}
