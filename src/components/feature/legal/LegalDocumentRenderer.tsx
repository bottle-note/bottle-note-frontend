import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { LegalDocument } from '@/lib/legal/legalDocuments';

interface LegalDocumentRendererProps {
  document: LegalDocument;
}

const markdownStyles = [
  'break-words text-14 leading-28 text-fg-neutral',
  '[&_*]:select-text',
  '[&_h1]:mb-20 [&_h1]:text-24 [&_h1]:font-extrabold [&_h1]:leading-36',
  '[&_h2]:mb-12 [&_h2]:mt-40 [&_h2]:border-b [&_h2]:border-stroke-neutral-subtle',
  '[&_h2]:pb-8 [&_h2]:text-20 [&_h2]:font-bold [&_h2]:leading-28',
  '[&_h3]:mb-8 [&_h3]:mt-28 [&_h3]:text-16 [&_h3]:font-bold',
  '[&_p]:my-12',
  '[&_a]:font-medium [&_a]:underline',
  '[&_strong]:font-bold [&_strong]:text-fg-neutral',
  '[&_blockquote]:my-20 [&_blockquote]:rounded-md [&_blockquote]:border-l-4',
  '[&_blockquote]:border-stroke-brand-solid [&_blockquote]:bg-bg-neutral-weak',
  '[&_blockquote]:px-16 [&_blockquote]:py-12 [&_blockquote]:text-fg-neutral-muted',
  '[&_blockquote_p]:my-4',
  '[&_ul]:my-12 [&_ul]:list-disc [&_ul]:space-y-4 [&_ul]:pl-20',
  '[&_ol]:my-12 [&_ol]:list-decimal [&_ol]:space-y-4 [&_ol]:pl-20',
  '[&_li]:pl-4',
  '[&_hr]:my-32 [&_hr]:border-stroke-neutral-subtle',
  '[&_table]:my-20 [&_table]:block [&_table]:w-max [&_table]:max-w-full',
  '[&_table]:overflow-x-auto [&_table]:rounded-md [&_table]:border',
  '[&_table]:border-stroke-neutral-subtle [&_table]:text-12',
  '[&_thead]:bg-bg-neutral-weak',
  '[&_th]:whitespace-nowrap [&_th]:border-b [&_th]:border-r',
  '[&_th]:border-stroke-neutral-subtle [&_th]:px-12 [&_th]:py-8 [&_th]:text-left',
  '[&_th]:font-bold [&_th:last-child]:border-r-0',
  '[&_td]:min-w-112 [&_td]:border-b [&_td]:border-r',
  '[&_td]:border-stroke-neutral-subtle [&_td]:px-12 [&_td]:py-8 [&_td]:align-top',
  '[&_td:last-child]:border-r-0 [&_tr:last-child_td]:border-b-0',
  '[&_code]:rounded [&_code]:bg-bg-neutral-weak [&_code]:px-4 [&_code]:py-2',
].join(' ');

export function LegalDocumentRenderer({
  document,
}: LegalDocumentRendererProps) {
  const { metadata, content } = document;

  return (
    <article className="px-20 pb-safe-lg pt-32">
      <div className={markdownStyles}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          skipHtml
          components={{
            a: ({ href, ...props }) => (
              <a
                {...props}
                href={href}
                className={
                  href?.startsWith('mailto:')
                    ? 'text-fg-neutral-muted'
                    : 'text-subCoral'
                }
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      <footer className="mt-48 border-t border-stroke-neutral-subtle pt-16 text-11 leading-20 text-fg-neutral-muted">
        <p>문서 버전: {metadata.version}</p>
        <p>최종 수정일: {metadata.updatedAt}</p>
        <p>
          시행일:{' '}
          {metadata.effectiveDate ?? '검토 및 승인 후 확정될 예정입니다.'}
        </p>
      </footer>
    </article>
  );
}
