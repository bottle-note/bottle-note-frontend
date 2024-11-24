import { useFormContext } from 'react-hook-form';
import Toggle from '@/app/(primary)/_components/Toggle';

export default function ContentForm() {
  const { register, setValue, watch } = useFormContext();

  const handleToggle = () => {
    setValue('status', watch('status') === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC');
  };

  return (
    <article>
      <textarea
        placeholder="이 위스키에 대한 리뷰를 작성해보세요. (최대 1,000자)"
        className="text-12 w-full h-48"
        maxLength={1000}
        {...register('review')}
      />
      <div className="text-12 text-mainGray flex justify-between items-center">
        <Toggle
          isActive={watch('status') === 'PUBLIC'}
          onToggle={handleToggle}
        />
        <div>({watch('review')?.length}/1000)</div>
      </div>
    </article>
  );
}
