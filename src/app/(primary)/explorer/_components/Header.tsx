import Image from 'next/image';

import Logo from 'public/bottle_note_Icon_logo.svg';

export const Header = () => {
  return (
    <header className="p-5">
      <Image src={Logo} alt="Logo" priority />
    </header>
  );
};
