export default function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 bg-bg-neutral-solid text-fg-neutral-inverted px-16 py-8 rounded-lg">
      {message}
    </div>
  );
}
