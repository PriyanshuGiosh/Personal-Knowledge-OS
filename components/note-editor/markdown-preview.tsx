'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

// Custom component to highlight hashtags and wiki links in text
function HighlightedText({ children }: { children: string }) {
  // Split text by hashtags and wiki links
  const parts = children.split(/(#\w+|\[\[[^\]]+\]\])/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('#') && part.length > 1 && /^\w+$/.test(part.slice(1))) {
          return (
            <span key={index} className="text-blue-600 dark:text-blue-400 font-medium">
              {part}
            </span>
          );
        } else if (part.startsWith('[[') && part.endsWith(']]')) {
          const linkText = part.slice(2, -2); // Remove [[ and ]]
          return (
            <span key={index} className="text-purple-600 dark:text-purple-400 font-medium cursor-pointer hover:underline">
              {linkText}
            </span>
          );
        }
        return part;
      })}
    </>
  );
}

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={cn('prose prose-sm max-w-none', className)}>
      <ReactMarkdown
        components={{
          // Custom code block rendering with syntax highlighting
          code: (props) => {
            const { className, children, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const isInline = !match;

            return !isInline && language ? (
              <SyntaxHighlighter
                style={isDark ? oneDark : oneLight}
                language={language}
                PreTag="div"
                className="rounded-md"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code
                className={cn(
                  'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm',
                  className
                )}
                {...rest}
              >
                {children}
              </code>
            );
          },

          // Custom text processing for hashtags and wiki links
          p: ({ children }) => (
            <p className="mb-6 leading-relaxed text-foreground/90">
              {React.Children.map(children, (child) =>
                typeof child === 'string' ? <HighlightedText>{child}</HighlightedText> : child
              )}
            </p>
          ),

          // Also process hashtags in headings
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold mb-6 mt-8 first:mt-0 leading-tight">
              {React.Children.map(children, (child) =>
                typeof child === 'string' ? <HighlightedText>{child}</HighlightedText> : child
              )}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mb-4 mt-8 leading-tight">
              {React.Children.map(children, (child) =>
                typeof child === 'string' ? <HighlightedText>{child}</HighlightedText> : child
              )}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mb-3 mt-6 leading-snug">
              {React.Children.map(children, (child) =>
                typeof child === 'string' ? <HighlightedText>{child}</HighlightedText> : child
              )}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-medium mb-2 mt-5 leading-snug">
              {React.Children.map(children, (child) =>
                typeof child === 'string' ? <HighlightedText>{child}</HighlightedText> : child
              )}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-base font-medium mb-2 mt-4 leading-snug">
              {React.Children.map(children, (child) =>
                typeof child === 'string' ? <HighlightedText>{child}</HighlightedText> : child
              )}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-medium mb-2 mt-4 leading-snug text-muted-foreground">
              {React.Children.map(children, (child) =>
                typeof child === 'string' ? <HighlightedText>{child}</HighlightedText> : child
              )}
            </h6>
          ),

          // Enhanced list styles
          ul({ children }) {
            return <ul className="list-disc list-inside space-y-1 mb-4">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside space-y-1 mb-4">{children}</ol>;
          },

          // Enhanced blockquote
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground mb-4">
                {children}
              </blockquote>
            );
          },

          // Enhanced link styles
          a({ children, href }) {
            return (
              <a
                href={href}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },

          // Enhanced table styles
          table({ children }) {
            return (
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full divide-y divide-border">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="px-4 py-2 text-left text-sm font-semibold bg-muted">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-4 py-2 text-sm border-t border-border">
                {children}
              </td>
            );
          },

          // Enhanced horizontal rule
          hr() {
            return <hr className="my-8 border-border" />;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}