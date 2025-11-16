export interface Props {
  children: React.ReactNode;
}

export default function PageModal({ children }: Props) {
  return (
    <main className="z-50 fixed-container inset-0 bg-white">{children}</main>
  );
}
