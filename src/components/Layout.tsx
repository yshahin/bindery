import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { BookOpen, Menu, Instagram, Youtube, Mail } from 'lucide-react'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const navLinkClass = (path: string) => `
    nav-link px-1 py-2 text-sm font-medium transition-colors cursor-pointer
    ${isActive(path)
      ? 'border-b-2 border-saddle-brown text-saddle-brown'
      : 'text-stone-600 hover:text-stone-900'}
  `

  const mobileLinkClass = (path: string) => `
    block w-full text-left px-3 py-2 rounded-md
    ${isActive(path)
      ? 'bg-amber-50 text-saddle-brown'
      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}
  `

  return (
    <div className="flex flex-col min-h-screen">
      <div className="texture-overlay"></div>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center cursor-pointer">
              <BookOpen className="h-8 w-8 text-stone-700 mr-2" />
              <span className="serif-font font-bold text-2xl text-stone-800 tracking-wide">Waraq</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              <Link to="/" className={navLinkClass('/')}>Home</Link>
              <Link to="/tool" className={navLinkClass('/tool')}>Tool</Link>
              <Link to="/hole-guide" className={navLinkClass('/hole-guide')}>Hole Guide</Link>
              <Link to="/articles" className={navLinkClass('/articles')}>Articles</Link>
              <Link to="/videos" className={navLinkClass('/videos')}>Videos</Link>
              <Link to="/gallery" className={navLinkClass('/gallery')}>Gallery</Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-stone-600 hover:text-stone-900 focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-stone-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass('/')}>Home</Link>
              <Link to="/tool" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass('/tool')}>Tool</Link>
              <Link to="/hole-guide" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass('/hole-guide')}>Hole Guide</Link>
              <Link to="/articles" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass('/articles')}>Articles</Link>
              <Link to="/videos" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass('/videos')}>Videos</Link>
              <Link to="/gallery" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass('/gallery')}>Gallery</Link>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Outlet />
      </main>

      <footer className="bg-stone-100 border-t border-stone-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="serif-font font-bold text-lg text-stone-800">Waraq</span>
              <p className="text-sm text-stone-500 mt-1">Preserving the craft, one stitch at a time.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-stone-400 hover:text-stone-600"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-stone-400 hover:text-stone-600"><Youtube className="h-5 w-5" /></a>
              <a href="#" className="text-stone-400 hover:text-stone-600"><Mail className="h-5 w-5" /></a>
            </div>
          </div>
          <div className="mt-8 border-t border-stone-200 pt-8 text-center text-sm text-stone-400">
            <p className="mb-2">&copy; {new Date().getFullYear()} Waraq. All rights reserved.</p>
            <p>
              Special thanks to <a href="https://www.youtube.com/@FourKeysBookArts" target="_blank" rel="noopener noreferrer" className="hover:text-stone-600 underline decoration-stone-300">Four Keys Book Arts</a> for their invaluable tutorials and inspiration.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
