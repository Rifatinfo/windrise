import { NAV_MAIN, NAV_ROLE, NAV_SECONDARY, type NavItem } from "@/components/sidebar/nav-config";
import type { UserRole } from "@/types/role";
import { filterNavByRole } from "./filterNav";
import { getRoleLabel } from "./user-utils";

export type NavSearchEntry = {
  id: string;
  label: string;
  path: string;
  icon: NavItem["icon"];
  /** Parent menu label, or the section name for top-level entries. */
  context: string;
  /** Parent id, so the sidebar can expand the right group after navigating. */
  parentId?: string;
};

/**
 * Flattens the navigation into a searchable list of destinations.
 *
 * Role security: this runs the same `filterNavByRole` the sidebar itself
 * uses, so search can only ever surface what that role can already see.
 *
 * Collapsible parents are deliberately excluded — the sidebar renders them
 * as toggles, and their `path` values (e.g. /admin/create-admin) have no
 * route behind them, so offering them as results would navigate to a 404.
 */
export function buildNavSearchIndex(role: UserRole): NavSearchEntry[] {
  const sections: { items: NavItem[]; name: string }[] = [
    { items: NAV_MAIN, name: "Dashboards" },
    { items: NAV_ROLE, name: getRoleLabel(role) },
    { items: NAV_SECONDARY, name: "More" },
  ];

  const entries: NavSearchEntry[] = [];
  const seen = new Set<string>();

  const push = (entry: NavSearchEntry) => {
    if (!entry.path || seen.has(entry.path)) return;
    seen.add(entry.path);
    entries.push(entry);
  };

  for (const section of sections) {
    for (const item of filterNavByRole(section.items, role)) {
      if (item.children?.length) {
        for (const child of item.children) {
          push({
            id: child.id,
            label: child.label,
            path: child.path ?? "",
            icon: child.icon,
            context: item.label,
            parentId: item.id,
          });
        }
        continue;
      }
      push({
        id: item.id,
        label: item.label,
        path: item.path ?? "",
        icon: item.icon,
        context: section.name,
      });
    }
  }

  return entries;
}

/**
 * Case-insensitive match on label, parent/section label or path, ranked so
 * the most literal matches come first.
 */
export function searchNav(index: NavSearchEntry[], query: string): NavSearchEntry[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const scored: { entry: NavSearchEntry; score: number }[] = [];

  for (const entry of index) {
    const label = entry.label.toLowerCase();
    const context = entry.context.toLowerCase();
    const path = entry.path.toLowerCase();

    let score = -1;
    if (label.startsWith(needle)) score = 0;
    else if (label.includes(needle)) score = 1;
    else if (context.startsWith(needle)) score = 2;
    else if (context.includes(needle)) score = 3;
    else if (path.includes(needle)) score = 4;

    if (score >= 0) scored.push({ entry, score });
  }

  return scored
    .sort((a, b) => a.score - b.score || a.entry.label.localeCompare(b.entry.label))
    .map((item) => item.entry);
}
