import Image from 'next/image';

export default function Login() {
  return (
    <main className="w-full h-[100vh] flex flex-col justify-center items-center">
      <Image
        src="bottle_note_logo.svg"
        width={100}
        height={190}
        alt="bottle-note-logo"
      />
      <section className="flex flex-col mt-5 space-y-3">
        <button>카카오톡 로그인</button>
        <button>네이버 로그인</button>
        <button>구글 로그인</button>
        <button>애플 로그인</button>
      </section>
    </main>
  );
}
