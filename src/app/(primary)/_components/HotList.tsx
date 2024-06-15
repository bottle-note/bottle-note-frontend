'use client';

import React, { useEffect, useState } from 'react';
import { Alcohol } from '@/types/Alcohol';
import HorizontalItem from '@/components/HorizontalItem';
import { AlcoholsApi } from '@/app/api/AlcholsApi';

function HotList() {
  const [weeklyData, setWeeklyData] = useState<[] | Alcohol[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await AlcoholsApi.getPopular();
      setWeeklyData(result);
    };

    fetchData();
  }, []);
  return (
    <>
      {weeklyData.length !== 0 && (
        <div className="whitespace-nowrap overflow-x-auto flex space-x-2">
          {weeklyData.map((item) => {
            return (
              <div key={item.alcoholId} className="flex-shrink-0">
                <HorizontalItem data={item} />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default HotList;
