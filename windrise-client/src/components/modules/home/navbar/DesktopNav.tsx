

import { NavigationCategoryId, navigationData } from './Navigationdataset'
import { NavItem } from './NavItem'



type DesktopNavProps = {
  activeCategory: NavigationCategoryId | null
  onCategoryOpen: (id: NavigationCategoryId) => void
  onCategoryToggle: (id: NavigationCategoryId) => void
}
export function DesktopNav({
  activeCategory,
  onCategoryOpen,
  onCategoryToggle,
}: DesktopNavProps) {
  return (
    <nav
      aria-label="Primary navigation"
      className="flex items-center gap-9 xl:gap-16 md:gap-16"
    >
      {navigationData.map((category : any) => (
        <NavItem
          key={category.id}
          label={category.label}
          active={activeCategory === category.id}
          controls="desktop-mega-menu"
          onMouseEnter={() => onCategoryOpen(category.id)}
          onFocus={() => onCategoryOpen(category.id)}
          onClick={() => onCategoryToggle(category.id)}
        />
      ))}
    </nav>
  )
}


