import Label from '@/components/ui/Display/Label';
import AlcoholPickButton from '@/components/domain/alcohol/AlcoholPickButton';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import Star from '@/components/ui/Display/Star';
import SemanticIcon from '@/components/ui/Display/SemanticIcon';
import useModalStore from '@/store/modalStore';
import { AlcoholInfo } from '@/types/Alcohol';
import { useNavigateReviewWrite } from '@/hooks/useNavigateReviewWrite';

interface Props {
  data: AlcoholInfo;
  isPicked: boolean;
  setIsPicked: (value: boolean | ((prev: boolean) => boolean)) => void;
}

function AlcoholDetailHeader({ data, isPicked, setIsPicked }: Props) {
  const { handleLoginModal } = useModalStore();
  const { handleReviewWrite } = useNavigateReviewWrite();

  return (
    <section className="relative z-20 flex gap-4 px-5 pb-4">
      <AlcoholImage
        imageUrl={data?.alcoholUrlImg}
        outerHeightClass="h-[190px]"
        outerWidthClass="w-[120px]"
        innerHeightClass="h-[160px]"
        innerWidthClass="w-[88px]"
        bgColor="bg-palette-static-white"
        priority
        enableModal={true}
      />
      <article className="flex min-w-0 flex-1 flex-col justify-center gap-4 overflow-x-hidden text-fg-neutral">
        {data && (
          <>
            <div className="space-y-[6px]">
              <Label
                name={data.korCategory}
                styleClass="rounded-[4.62px] border-stroke-neutral-weak px-[7.69px] py-[3.85px] text-10 text-fg-neutral-muted"
              />
              <h1 className="text-20 font-bold whitespace-normal break-words">
                {data?.korName}
              </h1>
              <p className="text-12 whitespace-normal break-words text-fg-neutral-muted">
                {data?.engName.toUpperCase()}
              </p>
            </div>
            <div className="space-y-[10px]">
              <div className="flex items-end gap-2">
                <Star
                  rating={data?.rating}
                  size={27}
                  textStyle="text-27 font-extrabold leading-[27px]"
                  tone="brand"
                  align="end"
                />
                <div className="text-10 text-fg-neutral-muted">
                  (유저평가 {data.totalRatingsCount})
                </div>
              </div>
              <div className="border-[0.5px] border-stroke-neutral-subtle" />
              <div className="flex gap-3 text-fg-neutral-muted">
                <button
                  className="flex items-center gap-[3px]"
                  onClick={() => handleReviewWrite(data.alcoholId)}
                >
                  <SemanticIcon
                    src="/icon/edit-outlined-white.svg"
                    width={16}
                    height={16}
                  />
                  <p className="text-12 font-normal">리뷰 작성</p>
                </button>
                <div className="my-[0.1rem] border-[0.5px] border-stroke-neutral-subtle" />
                <AlcoholPickButton
                  size={16}
                  isPicked={isPicked}
                  alcoholId={Number(data.alcoholId)}
                  handleUpdatePicked={() => setIsPicked((prev) => !prev)}
                  onApiError={() => setIsPicked(isPicked)}
                  handleNotLogin={handleLoginModal}
                  pickBtnName="찜하기"
                  tone="neutral"
                />
              </div>
            </div>
          </>
        )}
      </article>
    </section>
  );
}

export default AlcoholDetailHeader;
