import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Label from '@/app/(primary)/_components/Label';
import PickBtn from '@/app/(primary)/_components/PickBtn';
import AlcoholImage from '@/app/(primary)/_components/AlcoholImage';
import { AuthService } from '@/lib/AuthService';
import Star from '@/components/Star';
import { truncStr } from '@/utils/truncStr';
import useModalStore from '@/store/modalStore';
import { AlcoholInfo } from '@/types/Alcohol';

interface Props {
  data: AlcoholInfo;
  isPicked: boolean;
  setIsPicked: (isPicked: boolean) => void;
}

function AlcoholBox({ data, isPicked, setIsPicked }: Props) {
  const router = useRouter();
  const { isLogin } = AuthService;
  const { handleLoginModal } = useModalStore();

  return (
    <section className="relative z-20 flex px-5 pb-[23px] space-x-5">
      {data?.alcoholUrlImg && (
        <AlcoholImage
          imageUrl={data?.alcoholUrlImg}
          outerHeightClass="h-[230px]"
          outerWidthClass="w-[140px]"
          innerHeightClass="h-[200px]"
          innerWidthClass="w-[100px]"
        />
      )}
      <article className="flex-1 py-3 text-white overflow-x-hidden">
        {data && (
          <>
            <div className="space-y-[6px]">
              <Label
                name={data.korCategory}
                styleClass="border-white px-[7.69px] py-[3.85px] rounded-[4.62px] text-10"
              />
              <h1 className="text-20 font-bold whitespace-normal break-words">
                {data.korName && truncStr(data.korName, 27)}
              </h1>
              <p className="text-12 whitespace-normal break-words">
                {data.engName && truncStr(data.engName.toUpperCase(), 45)}
              </p>
            </div>
            <div className="space-y-[10px] pt-5">
              <div className="flex items-baseline gap-7">
                <Star
                  rating={data?.rating}
                  size={27}
                  styleProps="text-white text-27 font-extrabold leading-[27px]"
                  color="white"
                />
                <div className="text-10 translate-y-[1px]">
                  (유저평가 {data.totalRatingsCount})
                </div>
              </div>
              <div className="border-[0.5px] border-white" />
              <div className="flex space-x-3">
                <button
                  className="flex items-end space-x-[0.5px]"
                  onClick={() => {
                    if (!isLogin || !data.alcoholId) {
                      handleLoginModal();
                      return;
                    }
                    router.push(`/review/register?alcoholId=${data.alcoholId}`);
                  }}
                >
                  <Image
                    src="/icon/edit-outlined-white.svg"
                    alt="write"
                    width={16}
                    height={16}
                  />
                  <p className="text-12 font-normal">리뷰 작성</p>
                </button>
                <div className="border-[0.5px] border-white my-[0.1rem]" />
                <PickBtn
                  isPicked={isPicked}
                  handleUpdatePicked={() => setIsPicked(!isPicked)}
                  handleError={() => setIsPicked(data.isPicked)}
                  handleNotLogin={handleLoginModal}
                  pickBtnName="찜하기"
                  alcoholId={Number(data.alcoholId)}
                  size={16}
                />
              </div>
            </div>
          </>
        )}
      </article>
    </section>
  );
}

export default AlcoholBox;
