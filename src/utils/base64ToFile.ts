import { v4 as uuidv4 } from 'uuid';

export const base64ToFile = (base64: string): File => {
  // Base64 문자열에서 실제 바이너리 데이터 부분을 분리합니다.
  const byteString = atob(base64.split(',')[1]);

  // Base64 문자열에서 MIME 타입을 추출합니다.
  const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];

  // 바이너리 데이터를 저장할 ArrayBuffer를 생성합니다.
  const ab = new ArrayBuffer(byteString.length);

  // ArrayBuffer를 기반으로 Uint8Array를 생성합니다.
  const ia = new Uint8Array(ab);

  // byteString의 각 문자를 해당하는 바이트 값으로 변환하여 Uint8Array에 저장합니다.
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  // Uint8Array를 사용하여 Blob 객체를 생성합니다.
  const blob = new Blob([ab], { type: mimeString });

  // Blob 객체를 사용하여 File 객체를 생성합니다.
  const file = new File([blob], `${uuidv4()}image.png`, { type: mimeString });

  return file;
};
