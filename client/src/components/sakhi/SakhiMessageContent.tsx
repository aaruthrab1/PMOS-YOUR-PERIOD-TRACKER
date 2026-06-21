import { type ReactNode } from 'react';
import { cn } from '@/lib/tokens';

interface SakhiMessageContentProps {
  content: string;
  className?: string;
}

/** Lightweight markdown for Sakhi replies — bold, lists, links, paragraphs. */
export function SakhiMessageContent({ content, className }: SakhiMessageContentProps) {
  const blocks = content.split(/\n\n+/);

  return (
    <div className={cn('space-y-2.5', className)}>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        const lines = trimmed.split('\n');
        const isBulletList = lines.every((l) => /^[-*•]\s/.test(l.trim()));
        const isNumberedList = lines.every((l) => /^\d+[.)]\s/.test(l.trim()));

        if (isBulletList) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-4">
              {lines.map((line, j) => (
                <li key={j}>{renderInline(line.replace(/^[-*•]\s/, ''))}</li>
              ))}
            </ul>
          );
        }

        if (isNumberedList) {
          return (
            <ol key={i} className="list-decimal space-y-1 pl-4">
              {lines.map((line, j) => (
                <li key={j}>{renderInline(line.replace(/^\d+[.)]\s/, ''))}</li>
              ))}
            </ol>
          );
        }

        return (
          <p key={i} className="whitespace-pre-wrap">
            {lines.map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {renderInline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s]+)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0];

    if (token.startsWith('**')) {
      parts.push(<strong key={match.index} className="font-semibold text-ink">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*')) {
      parts.push(<em key={match.index}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('[')) {
      const label = token.match(/^\[([^\]]+)\]/)?.[1] ?? 'Link';
      const href = token.match(/\(([^)]+)\)/)?.[1] ?? '#';
      parts.push(
        <a key={match.index} href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 underline underline-offset-2">
          {label}
        </a>,
      );
    } else {
      parts.push(
        <a key={match.index} href={token} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 underline underline-offset-2 break-all">
          {token}
        </a>,
      );
    }
    last = match.index + token.length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : [text];
}
