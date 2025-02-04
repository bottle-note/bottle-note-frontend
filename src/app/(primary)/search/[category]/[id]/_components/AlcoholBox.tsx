import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Label from '@/app/(primary)/_components/Label';
import PickBtn from '@/app/(primary)/_components/PickBtn';
import AlcoholImage from '@/app/(primary)/_components/AlcoholImage';
import { AuthService } from '@/lib/AuthService';
import Star from '@/components/Star';
import { truncStr } from '@/utils/truncStr';
import useModalStore from '@/store/modalStore';

function AlcoholBox({ data, alcoholId, isPicked, setIsPicked }: any) {
  const router = useRouter();
  const { isLogin } = AuthService;
  const { handleLoginModal } = useModalStore();

  return (
    <section className="relative z-10 flex px-5 pb-6 space-x-5">
      {data?.alcohols?.alcoholUrlImg && (
        <AlcoholImage
          imageUrl={data?.alcohols?.alcoholUrlImg}
          outerHeightClass="h-48"
          outerWidthClass="w-28"
          innerHeightClass="h-44"
          innerWidthClass="w-24"
        />
      )}
      <article className="flex-1 py-3 text-white space-y-2 overflow-x-hidden">
        {data?.alcohols && (
          <>
            <div className="space-y-1">
              <Label
                name={data.alcohols.korCategory}
                styleClass="border-white px-2 py-[0.15rem] rounded-md text-10"
              />
              <h1 className="text-20 font-semibold whitespace-normal break-words">
                {data.alcohols.korName && truncStr(data.alcohols.korName, 27)}
              </h1>
              <p className="text-13 whitespace-normal break-words">
                {data.alcohols.engName &&
                  truncStr(data.alcohols.engName.toUpperCase(), 45)}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-end gap-7">
                {data.alcohols.rating && (
                  <Star
                    rating={data.alcohols.rating}
                    size={27}
                    style="text-white text-27 font-bold"
                    color="white"
                  />
                )}
                <div className="text-10 font-bold mb-1">
                  (유저평가 {data.alcohols.totalRatingsCount})
                </div>
              </div>
              <div className="border-[0.5px] border-white" />
              <div className="flex space-x-3">
                <button
                  className="text-12 font-bold flex"
                  onClick={() => {
                    if (!isLogin || !alcoholId) {
                      handleLoginModal();
                      return;
                    }
                    router.push(`/review/register?alcoholId=${alcoholId}`);
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
                  handleError={() => setIsPicked(data?.alcohols?.isPicked)}
                  handleNotLogin={handleLoginModal}
                  pickBtnName="찜하기"
                  alcoholId={Number(alcoholId)}
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
