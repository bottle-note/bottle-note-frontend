import {
  Children,
  isValidElement,
  type ElementType,
  type ReactNode,
} from 'react';

export const filterChildComponent = (
  children: ReactNode,
  type: ElementType,
) => {
  const childElements = Children.toArray(children);
  return childElements.filter(
    (child) => isValidElement(child) && child.type === type,
  );
};
