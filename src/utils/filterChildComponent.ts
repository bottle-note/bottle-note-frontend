import React, { isValidElement } from 'react';

export const filterChildComponent = (
  children: React.ReactNode,
  type: ({ children }: any) => JSX.Element,
) => {
  const childrens = React.Children.toArray(children);
  return childrens.filter(
    (child) => isValidElement(child) && child.type === type,
  );
};
