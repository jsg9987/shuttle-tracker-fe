'use client';

import type { ArrivalTimeResponse } from '@/types';
import { ClockIcon, MapPinIcon } from '@heroicons/react/24/solid';

interface ArrivalInfoCardProps {
  arrivalInfo: ArrivalTimeResponse;
  onClose: () => void;
}

export const ArrivalInfoCard = ({ arrivalInfo, onClose }: ArrivalInfoCardProps) => {
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-6 z-10 max-w-md mx-auto">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900">{arrivalInfo.routeName}</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <ClockIcon className="w-6 h-6 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">예상 소요 시간</p>
            <p className="text-2xl font-bold text-blue-900">
              약 {arrivalInfo.estimatedMinutes}분
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
          <MapPinIcon className="w-6 h-6 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">예상 도착 시간</p>
            <p className="text-xl font-bold text-green-900">
              {formatTime(arrivalInfo.estimatedArrivalTime)}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500 text-center">
        실제 도착 시간은 교통 상황에 따라 달라질 수 있습니다.
      </p>
    </div>
  );
};
