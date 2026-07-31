import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { LegalDocument } from '@/lib/legal/legalDocuments';

interface LegalDocumentRendererProps {
  document: LegalDocument;
}

const markdownStyles = [
  'break-words text-14 leading-7 text-fg-neutral',
  '[&_*]:select-text',
  '[&_h1]:mb-5 [&_h1]:text-24 [&_h1]:font-extrabold [&_h1]:leading-9',
  '[&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:border-b [&_h2]:border-stroke-neutral-subtle',
  '[&_h2]:pb-2 [&_h2]:text-20 [&_h2]:font-bold [&_h2]:leading-7',
  '[&_h3]:mb-2 [&_h3]:mt-7 [&_h3]:text-16 [&_h3]:font-bold',
  '[&_p]:my-3',
  '[&_a]:font-medium [&_a]:text-subCoral [&_a]:underline',
  '[&_strong]:font-bold [&_strong]:text-fg-neutral',
  '[&_blockquote]:my-5 [&_blockquote]:rounded-md [&_blockquote]:border-l-4',
  '[&_blockquote]:border-stroke-brand-solid [&_blockquote]:bg-bg-neutral-weak',
  '[&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:text-fg-neutral-muted',
  '[&_blockquote_p]:my-1',
  '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5',
  '[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5',
  '[&_li]:pl-1',
  '[&_hr]:my-8 [&_hr]:border-stroke-neutral-subtle',
  '[&_table]:my-5 [&_table]:block [&_table]:w-max [&_table]:max-w-full',
  '[&_table]:overflow-x-auto [&_table]:rounded-md [&_table]:border',
  '[&_table]:border-stroke-neutral-subtle [&_table]:text-12',
  '[&_thead]:bg-bg-neutral-weak',
  '[&_th]:whitespace-nowrap [&_th]:border-b [&_th]:border-r',
  '[&_th]:border-stroke-neutral-subtle [&_th]:px-3 [&_th]:py-2 [&_th]:text-left',
  '[&_th]:font-bold [&_th:last-child]:border-r-0',
  '[&_td]:min-w-28 [&_td]:border-b [&_td]:border-r',
  '[&_td]:border-stroke-neutral-subtle [&_td]:px-3 [&_td]:py-2 [&_td]:align-top',
  '[&_td:last-child]:border-r-0 [&_tr:last-child_td]:border-b-0',
  '[&_code]:rounded [&_code]:bg-bg-neutral-weak [&_code]:px-1 [&_code]:py-0.5',
].join(' ');

export function LegalDocumentRenderer({
  document,
}: LegalDocumentRendererProps) {
  const { metadata, content } = document;

  return (
    <article className="px-5 pb-safe-lg pt-8">
      <div className={markdownStyles}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
          {content}
        </ReactMarkdown>
      </div>

      <footer className="mt-12 border-t border-stroke-neutral-subtle pt-4 text-11 leading-5 text-fg-neutral-muted">
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
