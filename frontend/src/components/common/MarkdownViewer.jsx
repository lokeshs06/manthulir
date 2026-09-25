import React from 'react';

/**
 * Clean, lightweight, dependency-free Markdown renderer for articles and guides.
 * Supports:
 * - Headings (#, ##, ###)
 * - Lists (bullet points, numbered)
 * - Blockquotes (>)
 * - Bold (**text**), Italic (*text*)
 * - Code blocks and inline code
 * - Paragraphs
 */
export const MarkdownViewer = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];

  lines.forEach((line, idx) => {
    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${idx}`}
            className="p-4 rounded-2xl bg-stone-900 text-emerald-400 font-mono text-xs overflow-x-auto my-3"
          >
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={idx} className="text-base font-bold text-stone-900 mt-5 mb-2">
          {formatInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={idx} className="text-lg font-black text-stone-900 mt-6 mb-3 pb-1 border-b border-stone-100">
          {formatInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h1 key={idx} className="text-xl font-black text-stone-900 mt-6 mb-4">
          {formatInline(line.slice(2))}
        </h1>
      );
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={idx}
          className="border-l-4 border-agri-600 pl-4 py-1.5 my-3 text-stone-700 italic bg-agri-50/50 rounded-r-xl text-xs sm:text-sm"
        >
          {formatInline(line.slice(2))}
        </blockquote>
      );
    } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      elements.push(
        <li key={idx} className="ml-5 list-disc text-xs sm:text-sm text-stone-700 my-1 leading-relaxed">
          {formatInline(line.trim().slice(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(line.trim())) {
      const match = line.trim().match(/^(\d+)\.\s(.*)$/);
      elements.push(
        <li key={idx} className="ml-5 list-decimal text-xs sm:text-sm text-stone-700 my-1 leading-relaxed">
          {formatInline(match[2])}
        </li>
      );
    } else if (line.trim().length === 0) {
      elements.push(<div key={idx} className="h-2" />);
    } else {
      elements.push(
        <p key={idx} className="text-xs sm:text-sm text-stone-700 leading-relaxed my-2">
          {formatInline(line)}
        </p>
      );
    }
  });

  return <div className="prose-content space-y-1">{elements}</div>;
};

// Helper for inline styles (bold, italic, code)
function formatInline(text) {
  // Simple token parsing
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
    if (boldMatch) {
      parts.push(
        <strong key={key++} className="font-bold text-stone-900">
          {boldMatch[2]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic: *text*
    const italicMatch = remaining.match(/^(\*|_)(.*?)\1/);
    if (italicMatch) {
      parts.push(
        <em key={key++} className="italic text-stone-800">
          {italicMatch[2]}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Inline Code: `text`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-800 font-mono text-[11px] border border-stone-200"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Next plain character
    parts.push(remaining[0]);
    remaining = remaining.slice(1);
  }

  return parts;
}
