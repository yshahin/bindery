import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'strict',
  fontFamily: 'Crimson Pro, serif',
});

interface MermaidProps {
  chart: string;
}

const Mermaid = ({ chart }: MermaidProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [id] = useState(() => `mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (chart && ref.current) {
      mermaid.render(id, chart).then(({ svg }) => {
        setSvg(svg);
      }).catch((error) => {
        console.error('Mermaid render error:', error);
        setSvg(`<div class="text-red-500">Failed to render diagram</div>`);
      });
    }
  }, [chart, id]);

  return (
    <div
      className="mermaid-wrapper my-8 flex justify-center bg-stone-50 p-4 rounded-lg border border-stone-200"
      ref={ref}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default Mermaid;
