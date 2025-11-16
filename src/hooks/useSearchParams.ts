'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function useSearchParam<T extends string | null>(key: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setValue = (value: T | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const search = params.toString();
    const query = search ? `?${search}` : '';

    router.replace(`${pathname}${query}`);
  };

  return [searchParams.get(key) as T, setValue] as const;
}
