'use client';

import { SubHeader } from '@/components/ui/Navigation/SubHeader';

export default function HomeHeader() {
  return (
    <SubHeader>
      <SubHeader.Left>
        <SubHeader.Logo />
      </SubHeader.Left>
      <SubHeader.Right>
        <SubHeader.Menu />
      </SubHeader.Right>
    </SubHeader>
  );
}
