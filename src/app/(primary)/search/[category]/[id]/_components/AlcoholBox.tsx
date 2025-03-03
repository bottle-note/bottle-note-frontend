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
    <section className="relative z-10 flex px-5 pb-6 space-x-5">
      {data?.alcoholUrlImg && (
        <AlcoholImage
          imageUrl={data?.alcoholUrlImg}
          outerHeightClass="h-48"
          outerWidthClass="w-28"
          innerHeightClass="h-44"
          innerWidthClass="w-24"
        />
      )}
      <article className="flex-1 py-3 text-white space-y-2 overflow-x-hidden">
        {data && (
          <>
            <div className="space-y-1">
              <Label
                name={data.korCategory}
                styleClass="border-white px-2 py-[0.15rem] rounded-md text-10"
              />
              <h1 className="text-20 font-semibold whitespace-normal break-words">
                {data.korName && truncStr(data.korName, 27)}
              </h1>
              <p className="text-13 whitespace-normal break-words">
                {data.engName && truncStr(data.engName.toUpperCase(), 45)}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-end gap-7">
                <Star
                  rating={data?.rating}
                  size={27}
                  styleProps="text-white text-27 leading-[40px] font-bold"
                  color="white"
                />
                <div className="text-10 font-bold mb-1">
                  (유저평가 {data.totalRatingsCount})
                </div>
              </div>
              <div className="border-[0.5px] border-white" />
              <div className="flex space-x-3">
                <button
                  className="text-12 font-bold flex"
                  onClick={() => {
                    if (!isLogin || !data.alcoholId) {
                      handleLoginModal();
                      return;
                    }
                    router.push(`/review/register?alcoholId=${data.alcoholId}`);
                  }}
                >
                  <Image
                    className="mr-1"
                    src="/icon/edit-outlined-white.svg"
                    alt="write"
                    width={18}
                    height={18}
                  />
                  리뷰 작성
                </button>
                <div className="border-[0.5px] border-white my-[0.1rem]" />
                <PickBtn
                  isPicked={isPicked}
                  handleUpdatePicked={() => setIsPicked(!isPicked)}
                  handleError={() => setIsPicked(data.isPicked)}
                  handleNotLogin={handleLoginModal}
                  pickBtnName="찜하기"
                  alcoholId={Number(data.alcoholId)}
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
