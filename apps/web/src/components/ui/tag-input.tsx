import { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchTags, useTags } from '@/hooks/useTags';
import type { Tag } from '@/services/tags.service';

interface TagInputProps {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxTags?: number;
}

export function TagInput({
  value,
  onChange,
  placeholder = 'Ajouter un tag...',
  disabled = false,
  maxTags = 20,
}: TagInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: allTags = [] } = useTags();
  const { data: searchResults = [] } = useSearchTags(input, input.length > 0);

  // Filter out already selected tags
  const suggestions = (input ? searchResults : allTags)
    .filter((tag) => !value.some((v) => v.id === tag.id))
    .slice(0, 8);

  // Check if input matches an existing tag exactly
  const exactMatch = suggestions.find(
    (t) => t.name.toLowerCase() === input.toLowerCase()
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tag: Tag | string) => {
    if (value.length >= maxTags) return;

    if (typeof tag === 'string') {
      // Create new tag (will be created on server when saving)
      const newTag: Tag = {
        id: `new-${Date.now()}`,
        name: tag.toLowerCase().trim(),
        color: '#6366f1',
        createdById: '',
        createdAt: new Date().toISOString(),
      };
      onChange([...value, newTag]);
    } else {
      onChange([...value, tag]);
    }
    setInput('');
    setShowSuggestions(false);
    setHighlightedIndex(0);
  };

  const removeTag = (tagId: string) => {
    onChange(value.filter((t) => t.id !== tagId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0 && highlightedIndex < suggestions.length) {
        addTag(suggestions[highlightedIndex]);
      } else if (input.trim()) {
        addTag(input.trim());
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1].id);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          'flex flex-wrap gap-1.5 p-2 border rounded-lg bg-white min-h-[42px]',
          'focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Selected tags */}
        {value.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: tag.color + '20',
              color: tag.color,
            }}
          >
            {tag.name}
            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag.id);
                }}
                className="hover:bg-black/10 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}

        {/* Input */}
        {!disabled && value.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[100px] outline-none text-sm bg-transparent"
            disabled={disabled}
          />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (suggestions.length > 0 || (input.trim() && !exactMatch)) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((tag, index) => (
            <button
              key={tag.id}
              onClick={() => addTag(tag)}
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2',
                index === highlightedIndex && 'bg-slate-50'
              )}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              <span>{tag.name}</span>
              {tag._count && (
                <span className="text-xs text-slate-400 ml-auto">
                  {tag._count.documents} doc{tag._count.documents !== 1 ? 's' : ''}
                </span>
              )}
            </button>
          ))}

          {/* Create new tag option */}
          {input.trim() && !exactMatch && (
            <button
              onClick={() => addTag(input.trim())}
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100',
                suggestions.length === highlightedIndex && 'bg-slate-50'
              )}
            >
              <Plus className="w-4 h-4 text-primary-600" />
              <span>
                Créer "<span className="font-medium">{input.trim()}</span>"
              </span>
            </button>
          )}
        </div>
      )}

      {/* Max tags warning */}
      {value.length >= maxTags && (
        <p className="text-xs text-amber-600 mt-1">
          Nombre maximum de tags atteint ({maxTags})
        </p>
      )}
    </div>
  );
}
