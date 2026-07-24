'use client';

import {
  ChangeEvent,
  DragEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  ImageUp,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import {
  IMAGE_PROCESSING_OPTIONS,
  type ProcessedImage,
  processImage,
} from '../_utils/processImage';

interface TestState {
  sourceFile: File;
  sourceUrl: string;
  result: ProcessedImage;
  resultUrl: string;
}

interface CheckItem {
  label: string;
  passed: boolean;
  detail: string;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** unitIndex;
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDimensions(width: number, height: number) {
  return `${width.toLocaleString()} × ${height.toLocaleString()} px`;
}

function formatExif(value: boolean | null) {
  if (value === null) return 'HEIC 원본은 미확인';
  return value ? 'EXIF 마커 있음' : 'EXIF 마커 없음';
}

function Preview({
  src,
  alt,
  unavailableText,
}: {
  src: string;
  alt: string;
  unavailableText: string;
}) {
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => setIsUnavailable(false), [src]);

  return (
    <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-sectionWhite">
      {isUnavailable ? (
        <p className="px-5 text-center text-12 text-mainGray">
          {unavailableText}
        </p>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes="(max-width: 468px) 50vw, 220px"
          className="object-contain"
          onError={() => setIsUnavailable(true)}
        />
      )}
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-brightGray/40 py-2.5 last:border-b-0">
      <dt className="shrink-0 text-12 text-mainGray">{label}</dt>
      <dd className="break-all text-right text-12 font-medium text-mainBlack">
        {value}
      </dd>
    </div>
  );
}

export default function ImageProcessingTest() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [testState, setTestState] = useState<TestState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState('');
  const [useWebWorker, setUseWebWorker] = useState(true);

  const releaseUrls = useCallback((state: TestState | null) => {
    if (!state) return;
    URL.revokeObjectURL(state.sourceUrl);
    URL.revokeObjectURL(state.resultUrl);
  }, []);

  useEffect(
    () => () => {
      releaseUrls(testState);
    },
    [releaseUrls, testState],
  );

  const reset = () => {
    releaseUrls(testState);
    setTestState(null);
    setError('');
    setProgress(0);
    setProgressMessage('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const runTest = async (file: File) => {
    releaseUrls(testState);
    setTestState(null);
    setError('');
    setProgress(0);
    setIsProcessing(true);
    setProgressMessage('파일을 준비하는 중입니다.');

    const sourceUrl = URL.createObjectURL(file);

    try {
      const result = await processImage(file, {
        useWebWorker,
        onProgress: (nextProgress, message) => {
          setProgress(nextProgress);
          setProgressMessage(message);
        },
      });
      const resultUrl = URL.createObjectURL(result.file);
      setTestState({ sourceFile: file, sourceUrl, result, resultUrl });
    } catch (caughtError) {
      URL.revokeObjectURL(sourceUrl);
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : '이미지 전처리에 실패했습니다.';
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void runTest(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isProcessing) return;

    const file = event.dataTransfer.files?.[0];
    if (file) void runTest(file);
  };

  const checks: CheckItem[] = testState
    ? [
        {
          label: 'WebP 형식',
          passed:
            testState.result.file.type === IMAGE_PROCESSING_OPTIONS.outputType,
          detail: testState.result.file.type,
        },
        {
          label: 'WebP 확장자',
          passed: testState.result.file.name.toLowerCase().endsWith('.webp'),
          detail: testState.result.file.name,
        },
        {
          label: '최장변 1080px 이하',
          passed:
            Math.max(
              testState.result.resultDimensions.width,
              testState.result.resultDimensions.height,
            ) <= IMAGE_PROCESSING_OPTIONS.maxWidthOrHeight,
          detail: formatDimensions(
            testState.result.resultDimensions.width,
            testState.result.resultDimensions.height,
          ),
        },
        {
          label: '업스케일하지 않음',
          passed:
            testState.result.resultDimensions.width <=
              testState.result.sourceDimensions.width &&
            testState.result.resultDimensions.height <=
              testState.result.sourceDimensions.height,
          detail: `${formatDimensions(
            testState.result.sourceDimensions.width,
            testState.result.sourceDimensions.height,
          )} → ${formatDimensions(
            testState.result.resultDimensions.width,
            testState.result.resultDimensions.height,
          )}`,
        },
        {
          label: 'EXIF 마커 제거',
          passed: !testState.result.resultHasExifMarker,
          detail: testState.result.resultHasExifMarker
            ? '결과에 EXIF 마커가 남아 있습니다.'
            : '결과에서 EXIF 마커가 발견되지 않았습니다.',
        },
      ]
    : [];

  const sizeReduction = testState
    ? (1 - testState.result.file.size / testState.sourceFile.size) * 100
    : 0;

  return (
    <div className="min-h-safe-screen bg-white px-5 pb-12 pt-safe">
      <header className="pb-7 pt-6">
        <p className="text-12 font-bold text-subCoral">INTERNAL TEST</p>
        <h1 className="mt-1 text-24 font-extrabold text-mainBlack">
          이미지 전처리 테스트
        </h1>
        <p className="mt-2 text-13 leading-5 text-mainGray">
          파일은 서버로 전송되지 않습니다. 현재 브라우저 안에서 WebP 변환 결과만
          확인합니다.
        </p>
      </header>

      <section className="mb-5 rounded-xl bg-sectionWhite p-4">
        <h2 className="text-14 font-bold text-mainBlack">고정 전처리 조건</h2>
        <dl className="mt-2">
          <MetricRow label="출력 형식" value="WebP" />
          <MetricRow label="최대 크기" value="최장변 1,080px" />
          <MetricRow label="화질" value="0.8" />
          <MetricRow label="메타데이터" value="EXIF 보존 안 함" />
        </dl>
        <label className="mt-3 flex items-center justify-between gap-4 border-t border-brightGray/40 pt-3">
          <span>
            <span className="block text-12 font-bold text-mainBlack">
              Web Worker 요청
            </span>
            <span className="mt-0.5 block text-11 text-mainGray">
              실패하면 라이브러리가 메인 스레드로 재시도합니다.
            </span>
          </span>
          <input
            type="checkbox"
            checked={useWebWorker}
            disabled={isProcessing}
            onChange={(event) => setUseWebWorker(event.target.checked)}
            className="h-5 w-5 accent-subCoral"
          />
        </label>
      </section>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        disabled={isProcessing}
        onChange={handleFileChange}
        className="hidden"
      />
      <div
        role="button"
        tabIndex={0}
        onClick={() => !isProcessing && inputRef.current?.click()}
        onKeyDown={(event) => {
          if ((event.key === 'Enter' || event.key === ' ') && !isProcessing) {
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-mainCoral bg-white px-5 text-center focus:outline-none focus:ring-2 focus:ring-subCoral/40"
      >
        <ImageUp className="mb-3 text-subCoral" size={30} />
        <p className="text-15 font-bold text-mainBlack">
          {isProcessing ? '이미지를 처리하고 있습니다' : '테스트 이미지 선택'}
        </p>
        <p className="mt-1 text-12 text-mainGray">
          JPEG, PNG, WebP, HEIC, HEIF · 한 번에 한 장
        </p>
      </div>

      {isProcessing && (
        <section className="mt-5 rounded-xl border border-mainCoral/50 p-4">
          <div className="flex items-center justify-between text-12">
            <span className="font-medium text-mainBlack">
              {progressMessage}
            </span>
            <span className="font-bold text-subCoral">{progress}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-bgGray">
            <div
              className="h-full rounded-full bg-subCoral transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-11 leading-4 text-mainGray">
            HEIC와 고해상도 사진은 기기에 따라 시간이 걸릴 수 있습니다.
          </p>
        </section>
      )}

      {error && (
        <section className="mt-5 rounded-xl border border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 shrink-0 text-red-600" size={18} />
            <div>
              <h2 className="text-14 font-bold text-red-700">전처리 실패</h2>
              <p className="mt-1 break-all text-12 leading-5 text-red-700">
                {error}
              </p>
            </div>
          </div>
        </section>
      )}

      {testState && (
        <>
          <section className="mt-7">
            <h2 className="text-16 font-bold text-mainBlack">육안 비교</h2>
            <p className="mt-1 text-12 text-mainGray">
              방향, 잘림, 색상, 투명 배경이 같은지 직접 확인하세요.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="mb-2 text-12 font-bold text-mainGray">원본</p>
                <Preview
                  src={testState.sourceUrl}
                  alt="전처리 전 원본"
                  unavailableText="이 브라우저에서는 HEIC 원본 미리보기를 지원하지 않을 수 있습니다."
                />
              </div>
              <div>
                <p className="mb-2 text-12 font-bold text-subCoral">결과</p>
                <Preview
                  src={testState.resultUrl}
                  alt="전처리된 WebP 결과"
                  unavailableText="변환 결과를 표시하지 못했습니다."
                />
              </div>
            </div>
          </section>

          <section className="mt-7">
            <h2 className="text-16 font-bold text-mainBlack">자동 검사</h2>
            <div className="mt-3 space-y-2">
              {checks.map((check) => (
                <div
                  key={check.label}
                  className="flex items-start gap-3 rounded-xl bg-sectionWhite p-3"
                >
                  {check.passed ? (
                    <CheckCircle2
                      className="mt-0.5 shrink-0 text-green-600"
                      size={18}
                    />
                  ) : (
                    <XCircle
                      className="mt-0.5 shrink-0 text-red-600"
                      size={18}
                    />
                  )}
                  <div>
                    <p className="text-13 font-bold text-mainBlack">
                      {check.label}
                    </p>
                    <p className="mt-0.5 break-all text-11 leading-4 text-mainGray">
                      {check.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-brightGray/60 p-4">
              <h2 className="text-14 font-bold text-mainBlack">원본 정보</h2>
              <dl className="mt-2">
                <MetricRow label="파일명" value={testState.sourceFile.name} />
                <MetricRow
                  label="형식"
                  value={testState.sourceFile.type || '알 수 없음'}
                />
                <MetricRow
                  label="HEIC 판정"
                  value={testState.result.sourceWasHeic ? '예' : '아니요'}
                />
                <MetricRow
                  label="해상도"
                  value={formatDimensions(
                    testState.result.sourceDimensions.width,
                    testState.result.sourceDimensions.height,
                  )}
                />
                <MetricRow
                  label="용량"
                  value={formatBytes(testState.sourceFile.size)}
                />
                <MetricRow
                  label="메타데이터"
                  value={formatExif(testState.result.sourceHasExifMarker)}
                />
              </dl>
            </div>
            <div className="rounded-xl border border-subCoral/60 p-4">
              <h2 className="text-14 font-bold text-subCoral">결과 정보</h2>
              <dl className="mt-2">
                <MetricRow label="파일명" value={testState.result.file.name} />
                <MetricRow label="형식" value={testState.result.file.type} />
                <MetricRow
                  label="해상도"
                  value={formatDimensions(
                    testState.result.resultDimensions.width,
                    testState.result.resultDimensions.height,
                  )}
                />
                <MetricRow
                  label="용량"
                  value={formatBytes(testState.result.file.size)}
                />
                <MetricRow
                  label="용량 변화"
                  value={`${sizeReduction >= 0 ? '-' : '+'}${Math.abs(
                    sizeReduction,
                  ).toFixed(1)}%`}
                />
                <MetricRow
                  label="처리 시간"
                  value={`${(testState.result.durationMs / 1000).toFixed(2)}초`}
                />
                <MetricRow
                  label="메타데이터"
                  value={formatExif(testState.result.resultHasExifMarker)}
                />
              </dl>
            </div>
          </section>

          <div className="mt-7 flex flex-col gap-2">
            <a
              href={testState.resultUrl}
              download={testState.result.file.name}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-subCoral text-15 font-bold text-white"
            >
              <Download size={18} />
              결과 WebP 내려받기
            </a>
            <button
              type="button"
              onClick={reset}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-subCoral text-15 font-bold text-subCoral"
            >
              <RotateCcw size={18} />
              다른 이미지 테스트
            </button>
          </div>
        </>
      )}
    </div>
  );
}
