import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("ranking", "routes/ranking.tsx"),
  route("pokemon/:id", "routes/pokemon.tsx"),
  route("api/opponent/:name", "routes/api.opponent.tsx"),
] satisfies RouteConfig;
