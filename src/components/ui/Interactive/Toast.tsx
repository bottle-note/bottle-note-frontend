export default function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-black/80 text-white px-4 py-2 rounded-lg">
      {message}
    </div>
  );
}
