import { Link, NavLink } from 'react-router-dom'

const navItems = [
  ['首页', '/'],
  ['往期', '/issues'],
  ['关于', '/about'],
]

export function Header() {
  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="回到首页">
        <span className="brand-mark" aria-hidden="true"></span>
        <span>万物小窗</span>
      </Link>
      <nav className="site-nav" aria-label="主导航">
        {navItems.map(([label, to]) => (
          <NavLink
            className={({ isActive }) => (isActive ? 'is-active' : undefined)}
            end={to === '/'}
            key={to}
            to={to}
          >
            {label}
          </NavLink>
        ))}
        <a href="/rss.xml">RSS</a>
      </nav>
    </header>
  )
}
