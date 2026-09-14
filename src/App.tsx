import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import BookletTool from './pages/BookletTool'
import Home from './pages/Home'
import Tutorials from './pages/Tutorials'
import Articles from './pages/Articles'
import ArticleDetail from './pages/ArticleDetail'
import Gallery from './pages/Gallery'
import HoleGuide from './pages/HoleGuide'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tool" element={<BookletTool />} />
          <Route path="hole-guide" element={<HoleGuide />} />
          <Route path="articles" element={<Articles />} />
          <Route path="articles/:id" element={<ArticleDetail />} />
          <Route path="videos" element={<Tutorials />} />
          <Route path="gallery" element={<Gallery />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}


export default App


