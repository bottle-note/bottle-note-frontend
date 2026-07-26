import { promises as fs } from 'node:fs';
import path from 'node:path';

const LEGAL_CONTENT_DIRECTORY = path.join(
  process.cwd(),
  'src',
  'content',
  'legal',
);

const LEGAL_DOCUMENT_FILES = {
  'privacy-policy': 'privacy-policy.md',
  terms: 'terms.md',
} as const;

export type LegalDocumentSlug = keyof typeof LEGAL_DOCUMENT_FILES;

export interface LegalDocumentMetadata {
  title: string;
  version: string;
  status: 'draft' | 'published';
  effectiveDate: string | null;
  updatedAt: string;
}

export interface LegalDocument {
  metadata: LegalDocumentMetadata;
  content: string;
}

interface ParsedFrontmatter {
  attributes: Record<string, string | null>;
  content: string;
}

const parseFrontmatterValue = (value: string): string | null => {
  const trimmedValue = value.trim();

  if (trimmedValue === 'null') return null;

  const isQuoted =
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"));

  return isQuoted ? trimmedValue.slice(1, -1) : trimmedValue;
};

export const parseFrontmatter = (source: string): ParsedFrontmatter => {
  const normalizedSource = source.replace(/\r\n/g, '\n');

  if (!normalizedSource.startsWith('---\n')) {
    return { attributes: {}, content: normalizedSource.trimStart() };
  }

  const frontmatterEnd = normalizedSource.indexOf('\n---\n', 4);

  if (frontmatterEnd === -1) {
    throw new Error('Legal document frontmatter is not closed.');
  }

  const attributes = normalizedSource
    .slice(4, frontmatterEnd)
    .split('\n')
    .reduce<Record<string, string | null>>((result, line) => {
      const separatorIndex = line.indexOf(':');

      if (separatorIndex === -1) return result;

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1);

      if (!key) return result;

      return {
        ...result,
        [key]: parseFrontmatterValue(value),
      };
    }, {});

  return {
    attributes,
    content: normalizedSource.slice(frontmatterEnd + 5).trimStart(),
  };
};

const requireStringAttribute = (
  attributes: Record<string, string | null>,
  key: string,
  fileName: string,
): string => {
  const value = attributes[key];

  if (!value) {
    throw new Error(`${fileName} is missing the "${key}" frontmatter field.`);
  }

  return value;
};

const createMetadata = (
  attributes: Record<string, string | null>,
  fileName: string,
): LegalDocumentMetadata => {
  const status = requireStringAttribute(attributes, 'status', fileName);

  if (status !== 'draft' && status !== 'published') {
    throw new Error(
      `${fileName} has an invalid "status" frontmatter field: ${status}`,
    );
  }

  return {
    title: requireStringAttribute(attributes, 'title', fileName),
    version: requireStringAttribute(attributes, 'version', fileName),
    status,
    effectiveDate: attributes.effectiveDate ?? null,
    updatedAt: requireStringAttribute(attributes, 'updatedAt', fileName),
  };
};

export const getLegalDocument = async (
  slug: LegalDocumentSlug,
): Promise<LegalDocument> => {
  const fileName = LEGAL_DOCUMENT_FILES[slug];
  const filePath = path.join(LEGAL_CONTENT_DIRECTORY, fileName);
  const source = await fs.readFile(filePath, 'utf8');
  const { attributes, content } = parseFrontmatter(source);

  return {
    metadata: createMetadata(attributes, fileName),
    content,
  };
};
