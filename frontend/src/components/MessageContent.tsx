import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import DOMPurify from 'dompurify';
import { Copy, Check } from 'lucide-react';
import './MessageContent.css';

interface MessageContentProps {
  content: string;
  isHtml?: boolean;
}

const MessageContent: React.FC<MessageContentProps> = ({ content, isHtml }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Auto-detect if content contains HTML or markdown
  const detectContentType = (text: string): boolean => {
    const htmlPattern = /<[^>]+>/;
    const markdownPattern = /^#{1,6}\s|^\*{1,2}[^*]+\*{1,2}|^\[.+\]\(.+\)|^```|^\|.+\|/m;
    return htmlPattern.test(text) || markdownPattern.test(text);
  };

  const shouldRenderRich = isHtml !== undefined ? isHtml : detectContentType(content);

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!shouldRenderRich) {
    return <div className="message-content plain-text">{content}</div>;
  }

  // Sanitize HTML content
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'code', 'pre', 'blockquote',
      'ul', 'ol', 'li', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div',
      'sup', 'sub', 'mark', 'del', 'ins'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.-]|$))/i,
  });

  return (
    <div className="message-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks with syntax highlighting
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            const codeId = `code-${Date.now()}-${Math.random()}`;
            
            return match ? (
              <div className="code-block-wrapper">
                <div className="code-block-header">
                  <span className="code-language">{match[1]}</span>
                  <button
                    className="copy-button"
                    onClick={() => copyToClipboard(codeString, codeId)}
                    title="Copy code"
                  >
                    {copiedCode === codeId ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
                <SyntaxHighlighter
                  style={oneDark as any}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: '0 0 8px 8px',
                    fontSize: '0.875rem',
                  }}
                  {...props}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="inline-code" {...props}>
                {children}
              </code>
            );
          },
          // Tables with fintech styling
          table({ children }) {
            return (
              <div className="table-wrapper">
                <table className="data-table">{children}</table>
              </div>
            );
          },
          // Links open in new tab
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="message-link"
              >
                {children}
              </a>
            );
          },
          // Custom paragraph spacing
          p({ children }) {
            return <p className="message-paragraph">{children}</p>;
          },
          // Headers with custom styling
          h1: ({ children }) => <h1 className="message-h1">{children}</h1>,
          h2: ({ children }) => <h2 className="message-h2">{children}</h2>,
          h3: ({ children }) => <h3 className="message-h3">{children}</h3>,
          h4: ({ children }) => <h4 className="message-h4">{children}</h4>,
          // Lists with custom styling
          ul: ({ children }) => <ul className="message-list">{children}</ul>,
          ol: ({ children }) => <ol className="message-list ordered">{children}</ol>,
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="message-blockquote">{children}</blockquote>
          ),
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MessageContent;