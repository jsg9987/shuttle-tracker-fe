'use client';

import type { ArrivalTimeResponse, StopArrivalInfo } from '@/types';
import { ClockIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { MapPinIcon } from '@heroicons/react/24/outline';

interface ArrivalInfoCardProps {
  arrivalInfo: ArrivalTimeResponse;
  onClose: () => void;
}

export const ArrivalInfoCard = ({ arrivalInfo, onClose }: ArrivalInfoCardProps) => {
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const upcomingStops = arrivalInfo.stops.filter((s) => s.status === 'UPCOMING');
  const nextStop = upcomingStops[0];

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg z-10 max-w-md mx-auto overflow-hidden">
      {/* 헤더 */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <MapPinIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-gray-900">{arrivalInfo.routeName}</h3>
          {arrivalInfo.fallback && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">대략</span>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
      </div>

      {/* 다음 정류장 강조 */}
      {nextStop && (
        <div className="flex items-center gap-3 px-5 py-3 bg-blue-50">
          <ClockIcon className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">다음 정류장</p>
            <p className="text-sm font-bold text-blue-900">
              {nextStop.stopName} — 약 {nextStop.estimatedMinutes}분 후 ({formatTime(nextStop.estimatedArrivalTime!)})
            </p>
          </div>
        </div>
      )}

      {/* 정류장 목록 */}
      <ul className="px-5 py-3 space-y-2 max-h-48 overflow-y-auto">
        {arrivalInfo.stops.map((stop) => (
          <StopRow key={stop.stopId} stop={stop} formatTime={formatTime} />
        ))}
      </ul>

      <p className="px-5 pb-3 text-xs text-gray-400 text-center">
        실제 도착 시간은 교통 상황에 따라 달라질 수 있습니다.
      </p>
    </div>
  );
};

const StopRow = ({
  stop,
  formatTime,
}: {
  stop: StopArrivalInfo;
  formatTime: (iso: string) => string;
}) => {
  const isPassed = stop.status === 'PASSED';

  return (
    <li className={`flex items-center gap-3 ${isPassed ? 'opacity-40' : ''}`}>
      {isPassed ? (
        <CheckCircleIcon className="w-4 h-4 text-gray-400 shrink-0" />
      ) : (
        <ExclamationCircleIcon className="w-4 h-4 text-blue-500 shrink-0" />
      )}
      <span className={`flex-1 text-sm ${isPassed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
        {stop.stopName}
      </span>
      {isPassed ? (
        <span className="text-xs text-gray-400">지남</span>
      ) : (
        <span className="text-xs font-medium text-blue-700">
          {stop.estimatedMinutes}분 후 {formatTime(stop.estimatedArrivalTime!)}
        </span>
      )}
    </li>
  );
};