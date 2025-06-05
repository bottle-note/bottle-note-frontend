import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

import Logo from 'public/bottle_note_Icon_logo.svg';

export const Header = () => {
  return (
    <header className="p-5 pt-14">
      <Link href={ROUTES.HOME}>
        <Image src={Logo} alt="Logo" priority />
      </Link>
    </header>
  );
};
