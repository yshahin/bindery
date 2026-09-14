import { useParams, Link } from 'react-router-dom';
import { BookOpen, Clock, Play } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Mermaid from '../components/Mermaid';
import React, { ReactNode } from 'react';
import { articles } from '../data';

// Helper to extract text content recursively from React nodes
const getTextContent = (node: ReactNode): string => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(getTextContent).join('');
  if (React.isValidElement(node) && node.props && typeof node.props === 'object' && 'children' in node.props) {
    return getTextContent((node.props as { children: ReactNode }).children);
  }
  return '';
};

// Helper to extract YouTube ID
const getYouTubeId = (text: string) => {
  // Finds generic http(s) links in the text
  const match = text.match(/https?:\/\/[^\s]+/);
  if (!match) return null;
  const url = match[0];
  // Extracts ID specifically for Youtube
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/);
  return ytMatch ? ytMatch[1] : null;
};

export default function ArticleDetail() {
  const { id } = useParams();
  const selectedArticle = articles.find(a => a.id === id);

  if (!selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <h2 className="serif-font text-3xl text-stone-800 mb-4">Article not found</h2>
        <Link to="/articles" className="text-stone-500 hover:text-stone-800 underline">
          Return to Articles
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="animate-fade-in space-y-8">
        <Link
          to="/articles"
          className="text-stone-500 hover:text-stone-800 flex items-center gap-2 mb-4 transition-colors"
        >
          ← Back to Articles
        </Link>

        <div className="bg-white p-8 md:p-12 rounded-xl paper-shadow border border-stone-100 relative overflow-hidden">
          <div className="flex items-center gap-3 text-sm font-medium text-stone-500 mb-6 uppercase tracking-wider">
            <span className={`px-2 py-1 rounded-full bg-stone-100 text-stone-900`}>
              {selectedArticle.category}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock size={16} /> {selectedArticle.readTime}</span>
            <span>•</span>
            <span>{selectedArticle.date}</span>
          </div>

          <h1 className="serif-font text-4xl md:text-5xl text-stone-900 mb-8 leading-tight">
            {selectedArticle.title}
          </h1>

          <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed font-serif text-lg">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h3: ({ node, ...props }) => <h3 className="serif-font text-2xl font-bold text-stone-800 mt-6 mb-3" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-6 space-y-2 ml-4" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-6 space-y-2 ml-4" {...props} />,
                table: ({ node, ...props }) => (
                  <div className="overflow-hidden overflow-x-auto rounded-lg border border-[#e8e4dc] my-0">
                    <table className="w-full text-left border-collapse !my-0" {...props} />
                  </div>
                ),


                // Regular links
                a: ({ node, ...props }) => <a className="text-stone-600 hover:text-stone-900 underline decoration-stone-300 hover:decoration-stone-900 transition-all font-medium" {...props} />,

                // Handle images, including "Watch:" video embeds
                img: ({ node, ...props }) => {
                  const { alt, src } = props;
                  const isWatch = alt?.trim().startsWith('Watch:');

                  if (isWatch && src) {
                    const videoId = getYouTubeId(src);
                    if (videoId) {
                      return (
                        <div className="my-10 rounded-xl overflow-hidden shadow-lg border border-stone-200 aspect-video relative group">
                          <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={alt || "YouTube video player"}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                          <div className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full shadow-md z-10 pointer-events-none opacity-80">
                            <Play size={20} fill="currentColor" />
                          </div>
                        </div>
                      );
                    }
                  }

                  return (
                    <div className="my-8">
                      <img className="rounded-lg shadow-md border border-stone-100 w-full" {...props} />
                      {alt && <p className="text-center text-stone-500 text-sm mt-3 italic">{alt}</p>}
                    </div>
                  );
                },
                th: ({ node, ...props }) => <th className="p-3 font-serif font-bold text-[#5d4037] text-sm uppercase tracking-wider border-b border-[#d6d3cd] first:pl-4 last:pr-4" {...props} />,
                td: ({ node, ...props }) => <td className="p-3 text-stone-700 border-b border-[#f0eee6] bg-white/50 first:pl-4 last:pr-4" {...props} />,
                // Regular blockquotes (video embeds handled via links now)
                blockquote: ({ children }) => (
                  <div className="my-8 bg-stone-100 p-6 rounded-lg border border-stone-200 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-stone-400 mb-2 opacity-50" />
                    <div className="text-sm text-stone-500 italic">
                      {children}
                    </div>
                  </div>
                ),
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-mermaid/.exec(className || '');
                  return !inline && match ? (
                    <Mermaid chart={String(children).replace(/\n$/, '')} />
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }

              }}
            >
              {selectedArticle.content}
            </ReactMarkdown>
          </div>

          <div className="mt-12 pt-8 border-t border-stone-100 flex items-center justify-between text-stone-500 italic">
            <span>Written by Waraq Staff</span>
            <BookOpen size={20} className="opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}
