import { Link, NavLink } from "react-router";

const LINKS = [
  { to: "/", label: "계산기", end: true },
  { to: "/ranking", label: "사용률 순위", end: false },
];

// 모든 페이지 위의 공통 메뉴. 지금 보고 있는 메뉴는 노랑 밑줄.
export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between px-4 pt-4">
      <Link to="/" className="text-2xl font-bold">
        OHKO
      </Link>
      <nav className="flex gap-4 text-sm">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              isActive
                ? "font-semibold underline decoration-accent decoration-4 underline-offset-8"
                : "text-gray-600 hover:text-ink"
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
