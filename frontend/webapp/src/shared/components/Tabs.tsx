import { NavLink } from 'react-router-dom'

export interface TabItem {
  label: string
  to: string
  hidden?: boolean
}

interface TabsProps {
  items: TabItem[]
}

export function Tabs({ items }: TabsProps) {
  const visible = items.filter((item) => !item.hidden)

  return (
    <nav className="-mx-1 overflow-x-auto border-b border-border">
      <div className="flex min-w-0 flex-nowrap gap-1 px-1">
        {visible.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              [
                'shrink-0 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors border-b-2 -mb-px sm:px-4',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral hover:text-foreground',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
