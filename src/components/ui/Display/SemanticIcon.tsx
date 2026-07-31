import type { CSSProperties } from 'react';

interface Props {
  src: string;
  width: number;
  height?: number;
  className?: string;
  label?: string;
  style?: CSSProperties;
}

/**
 * 기존 SVG의 형태는 유지하고 색상만 부모의 시맨틱 전경색을 상속한다.
 */
export default function SemanticIcon({
  src,
  width,
  height = width,
  className = '',
  label,
  style,
}: Props) {
  const maskStyle: CSSProperties = {
    width,
    height,
    backgroundColor: 'currentColor',
    WebkitMaskImage: `url("${src}")`,
    maskImage: `url("${src}")`,
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    ...style,
  };

  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-semantic-icon={src}
      className={`inline-block shrink-0 ${className}`}
      style={maskStyle}
    />
  );
}
