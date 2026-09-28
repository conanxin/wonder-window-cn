import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout.jsx'
import { ScrollToTop } from './components/ScrollToTop.jsx'
import { AboutPage } from './pages/AboutPage.jsx'
import { ArchivePage } from './pages/ArchivePage.jsx'
import { EditorialPreviewPage } from './pages/EditorialPreviewPage.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { IssuePage } from './pages/IssuePage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/issues" element={<ArchivePage />} />
          <Route path="/issues/:slug" element={<IssuePage />} />
          {import.meta.env.DEV ? (
            <Route
              path="/editorial-preview/:slug"
              element={<EditorialPreviewPage />}
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
