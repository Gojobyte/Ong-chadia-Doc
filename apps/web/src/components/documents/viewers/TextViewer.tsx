import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TextViewerProps {
  url: string;
  mimeType?: string;
  fileName: string;
}

export function TextViewer({ url, fileName }: TextViewerProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch file');
        }
        const text = await response.text();
        setContent(text);
        setError(null);
      } catch (err) {
        setError('Impossible de charger le fichier texte');
        console.error('Text fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [url]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const getLanguage = (): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'xml':
        return 'xml';
      case 'yaml':
      case 'yml':
        return 'yaml';
      default:
        return 'plaintext';
    }
  };

  const formatContent = (text: string): string => {
    // Try to format JSON
    if (getLanguage() === 'json') {
      try {
        return JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        return text;
      }
    }
    return text;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <p className="text-red-400 mb-4">{error}</p>
        <p className="text-white/60 text-sm">Essayez de télécharger le fichier pour le visualiser</p>
      </div>
    );
  }

  const lines = formatContent(content).split('\n');

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 backdrop-blur-sm rounded-t-lg border-b border-slate-700">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm font-mono">{fileName}</span>
          <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
            {getLanguage()}
          </span>
          <span className="text-slate-500 text-xs">
            {lines.length} lignes
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className="text-slate-400 hover:text-white hover:bg-slate-700 text-xs"
          >
            {showLineNumbers ? 'Masquer' : 'Afficher'} numéros
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Copié
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Copier
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-slate-900 rounded-b-lg">
        <pre className="p-4 text-sm font-mono text-slate-300 leading-relaxed">
          <code>
            {lines.map((line, index) => (
              <div key={index} className="flex hover:bg-slate-800/50">
                {showLineNumbers && (
                  <span className="select-none text-slate-600 text-right pr-4 w-12 flex-shrink-0">
                    {index + 1}
                  </span>
                )}
                <span className="flex-1 whitespace-pre-wrap break-all">
                  {line || ' '}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
