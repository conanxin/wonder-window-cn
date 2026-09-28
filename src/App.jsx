import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout.jsx'
import { ScrollToTop } from './components/ScrollToTop.jsx'
import { AboutPage } from './pages/AboutPage.jsx'
import { ArchivePage } from './pages/ArchivePage.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { IssuePage } from './pages/IssuePage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'

const EditorialPreviewPage = import.meta.env.EDITORIAL_PREVIEW_ENABLED
  ? lazy(() => import('./pages/EditorialPreviewPage.jsx'))
  : null

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/issues" element={<ArchivePage />} />
          <Route path="/issues/:slug" element={<IssuePage />} />
          {EditorialPreviewPage ? (
            <Route
              path="/editorial-preview/:slug"
              element={
                <Suspense fallback={null}>
                  <EditorialPreviewPage />
                </Suspense>
              }
            />
          ) : null}
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
