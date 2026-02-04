import { useNavigate } from 'react-router-dom'
import { ArrowRight, Clock, Play, MailOpen } from 'lucide-react'
import { articles, videos } from '../data'

export default function Home() {
  const navigate = useNavigate()
  const latestArticle = articles[0];
  const featuredVideo = videos.length > 0 ? videos[0] : null;

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center py-16 md:py-24 space-y-6 animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-bold text-stone-900 leading-tight serif-font">The Art of <br /><span className="text-stone-500 italic">Bookbinding</span></h1>
        <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
          A digital workbench for binders of all skill levels. Explore tutorials, watch techniques in action, and discover the beauty of handmade books.
        </p>
        <div className="pt-8 flex justify-center gap-4">
          <button
            onClick={() => navigate('/articles')}
            className="bg-stone-800 text-white px-8 py-3 rounded-full hover:bg-stone-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
          >
            Start Learning
          </button>
          <button
            onClick={() => navigate('/gallery')}
            className="bg-white text-stone-800 border border-stone-300 px-8 py-3 rounded-full hover:bg-stone-50 transition-all font-semibold cursor-pointer"
          >
            View Gallery
          </button>
        </div>
      </div>

      {/* Featured Content Grid */}
      <div className="grid md:grid-cols-2 gap-12 mt-12">
        {/* Latest Tutorial */}
        <div
          className="bg-white p-8 rounded-xl paper-shadow border border-stone-100 hover:border-stone-300 transition-colors cursor-pointer group"
          onClick={() => navigate(`/articles/${latestArticle.id}`)}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold tracking-wider uppercase text-stone-400">Latest Article</span>
            <ArrowRight className="h-5 w-5 text-stone-300 group-hover:text-stone-800 transition-colors" />
          </div>
          <h2 className="serif-font text-3xl font-bold text-stone-800 mb-3 group-hover:text-amber-700 transition-colors">{latestArticle.title}</h2>
          <p className="text-stone-600 mb-6 leading-relaxed line-clamp-3">{latestArticle.excerpt}</p>
          <div className="flex items-center text-sm text-stone-400">
            <Clock className="h-4 w-4 mr-2" /> {latestArticle.readTime}
          </div>
        </div>

        {/* Featured Video */}
        {featuredVideo && (
          <div
            className="bg-stone-900 rounded-xl paper-shadow overflow-hidden relative group cursor-pointer"
            onClick={() => navigate('/videos')}
          >
            <img
              src={featuredVideo.thumbnail}
              alt={featuredVideo.title}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity"
            />
            <div className="absolute inset-0 bg-stone-900/40 group-hover:bg-stone-900/30 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full border border-white/30 group-hover:scale-110 transition-transform relative z-10">
                <Play className="h-8 w-8 text-white fill-current" />
              </div>
            </div>
            <div className="relative p-8 h-full flex flex-col justify-end z-10">
              <span className="text-amber-400 text-xs font-bold tracking-wider uppercase mb-2">Featured Video</span>
              <h2 className="serif-font text-3xl font-bold text-white drop-shadow-md">{featuredVideo.title}</h2>
            </div>
          </div>
        )}
      </div>

      {/* Newsletter */}
      <div className="mt-20 bg-amber-50 rounded-2xl p-8 md:p-12 text-center border border-amber-100">
        <MailOpen className="h-10 w-10 text-amber-700 mx-auto mb-4" />
        <h3 className="serif-font text-2xl font-bold text-stone-800 mb-2">Join the Guild</h3>
        <p className="text-stone-600 mb-6 max-w-md mx-auto">Get monthly binding tips, tool recommendations, and inspiration delivered to your inbox.</p>
        <div className="flex max-w-md mx-auto">
          <input type="email" placeholder="Email address" className="flex-grow px-4 py-2 rounded-l-lg border-y border-l border-stone-300 focus:outline-none focus:border-stone-500" />
          <button className="bg-stone-800 text-white px-6 py-2 rounded-r-lg font-medium hover:bg-stone-700 cursor-pointer">Subscribe</button>
        </div>
      </div>
    </div>
  )
}
