import { Outlet } from 'react-router-dom'
import { Header } from './Header.jsx'

export function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <span>万物小窗</span>
          <span>为注意力保留一块安静的地方。</span>
        </div>
      </footer>
    </>
  )
}
