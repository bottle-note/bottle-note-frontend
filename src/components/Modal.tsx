export interface Props {
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
}

export default function FullModal({ setModalOpen, children }: Props) {
  return <main className="z-10 fixed w-full inset-0 bg-white">{children}</main>;
}
