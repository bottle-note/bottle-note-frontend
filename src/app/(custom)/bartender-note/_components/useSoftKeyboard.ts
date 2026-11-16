import { useEffect, useState, type RefObject } from 'react';

// 보이는 높이가 이보다 낮으면 글 쓸 공간이 모자란 것으로 본다
const MIN_WRITING_HEIGHT = 640;

const KEYBOARD_INPUT_TYPES = new Set([
  'text',
  'search',
  'email',
  'number',
  'tel',
  'url',
  'password',
]);

/** 글 쓸 공간이 모자라면 tight이고, 그때 보이는 높이(px)를 함께 담는다. */
export type ViewportSpace =
  | { tight: false }
  | { tight: true; visibleHeight: number };

const visibleHeightOf = (space: ViewportSpace) =>
  space.tight ? space.visibleHeight : null;

const isWritableTextarea = (element: Element | null) =>
  element instanceof HTMLTextAreaElement && !element.readOnly;

const isWritableTextInput = (element: Element | null) =>
  element instanceof HTMLInputElement &&
  KEYBOARD_INPUT_TYPES.has(element.type) &&
  !element.readOnly;

const isEditableContent = (element: Element | null) =>
  element instanceof HTMLElement && element.isContentEditable;

const opensKeyboard = (element: Element | null) =>
  isWritableTextarea(element) ||
  isWritableTextInput(element) ||
  isEditableContent(element);

const measureWritingSpace = (
  focused: Element | null,
  height: number,
): ViewportSpace =>
  opensKeyboard(focused) && height < MIN_WRITING_HEIGHT
    ? { tight: true, visibleHeight: Math.round(height) }
    : { tight: false };

const hasSameVisibleHeight = (a: ViewportSpace, b: ViewportSpace) =>
  visibleHeightOf(a) === visibleHeightOf(b);

const scrollFocusedFieldIntoView = (container: HTMLElement | null) => {
  const focused = document.activeElement;
  if (focused instanceof HTMLElement && container?.contains(focused))
    focused.scrollIntoView({ block: 'nearest' });
};

function useViewportSpace(): ViewportSpace {
  const [space, setSpace] = useState<ViewportSpace>({ tight: false });

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const updateSpaceForFocused = (focused: Element | null) => {
      const next = measureWritingSpace(focused, viewport.height);
      setSpace((current) =>
        hasSameVisibleHeight(current, next) ? current : next,
      );
    };
    const onResize = () => updateSpaceForFocused(document.activeElement);
    const onFocusOut = (event: FocusEvent) =>
      updateSpaceForFocused(event.relatedTarget as Element | null);

    viewport.addEventListener('resize', onResize);
    document.addEventListener('focusin', onResize);
    document.addEventListener('focusout', onFocusOut);
    onResize();
    return () => {
      viewport.removeEventListener('resize', onResize);
      document.removeEventListener('focusin', onResize);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  return space;
}

function useKeepFocusedFieldVisible(
  visibleHeight: number | null,
  scrollContainer: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (visibleHeight === null) return;
    // iOS는 키보드를 띄울 때 페이지를 위로 밀어 올린다
    window.scrollTo(0, 0);
    scrollFocusedFieldIntoView(scrollContainer.current);
  }, [visibleHeight, scrollContainer]);
}

/** 글 쓸 공간이 모자란지 알려 주고, 모자라면 쓰던 칸이 보이게 스크롤을 맞춘다. */
export function useSoftKeyboard(
  scrollContainer: RefObject<HTMLElement | null>,
): ViewportSpace {
  const space = useViewportSpace();
  useKeepFocusedFieldVisible(visibleHeightOf(space), scrollContainer);
  return space;
}
