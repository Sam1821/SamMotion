"use client"

export type TabKey = "home" | "workout" | "gym" | "stats" | "log"

const TAB_ICONS: Record<TabKey, (c: string) => React.ReactNode> = {
  home: (c) => (
    <>
      <path
        d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="9 22 9 12 15 12 15 22"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  workout: (c) => (
    <>
      <rect x="3" y="9" width="18" height="6" rx="3" stroke={c} strokeWidth={2} strokeLinecap="round" />
      <rect x="0" y="11" width="3" height="2" rx="1" stroke={c} strokeWidth={2} />
      <rect x="21" y="11" width="3" height="2" rx="1" stroke={c} strokeWidth={2} />
    </>
  ),
  gym: (c) => (
    <>
      <path
        d="M12 2L2 7l10 5 10-5-10-5z"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 17l10 5 10-5"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12l10 5 10-5"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  stats: (c) => (
    <>
      <rect x="2" y="12" width="4" height="10" rx="1" stroke={c} strokeWidth={2} />
      <rect x="9" y="6" width="4" height="16" rx="1" stroke={c} strokeWidth={2} />
      <rect x="16" y="2" width="4" height="20" rx="1" stroke={c} strokeWidth={2} />
    </>
  ),
  log: (c) => (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke={c} strokeWidth={2} strokeLinecap="round" />
      <line x1="16" y1="2" x2="16" y2="6" stroke={c} strokeWidth={2} strokeLinecap="round" />
      <line x1="8" y1="2" x2="8" y2="6" stroke={c} strokeWidth={2} strokeLinecap="round" />
      <line x1="3" y1="10" x2="21" y2="10" stroke={c} strokeWidth={2} strokeLinecap="round" />
    </>
  ),
}

const TAB_LABELS: Record<TabKey, string> = {
  home: "Home",
  workout: "Train",
  gym: "Gym",
  stats: "Stats",
  log: "Log",
}

const TAB_ORDER: TabKey[] = ["home", "workout", "gym", "stats", "log"]

export function TabBar({
  active,
  onSelect,
}: {
  active: TabKey
  onSelect: (tab: TabKey) => void
}) {
  return (
    <nav className="tabs" aria-label="Main navigation">
      {TAB_ORDER.map((t) => {
        const on = t === active
        const color = on ? "#FF6B2B" : "#3A3A3A"
        return (
          <button
            key={t}
            type="button"
            className={`tab ${on ? "on" : ""}`}
            onClick={() => onSelect(t)}
            aria-current={on ? "page" : undefined}
            aria-label={TAB_LABELS[t]}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              {TAB_ICONS[t](color)}
            </svg>
            <span className="tlbl">{TAB_LABELS[t]}</span>
          </button>
        )
      })}
    </nav>
  )
}
