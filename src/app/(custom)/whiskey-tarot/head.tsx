export default function Head() {
  return (
    <>
      {/* LCP 이미지: 카드 뒷면 - 가장 먼저 보이는 이미지 */}
      <link
        rel="preload"
        href="/images/tarot/card-back.png"
        as="image"
        type="image/png"
      />
    </>
  );
}
