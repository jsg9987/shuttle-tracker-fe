'use client';

import { useState } from 'react';
import type { ShuttleStop, Friend } from '@/types';
import { Button } from '@/components/common';

interface StopSelectorProps {
  friend: Friend;
  stops: ShuttleStop[];
  selectedStops: ShuttleStop[];
  onStopsSelected: (stops: ShuttleStop[]) => void;
  onCalculate: () => void;
  isCalculating: boolean;
}

export const StopSelector = ({
  friend,
  stops,
  selectedStops,
  onStopsSelected,
  onCalculate,
  isCalculating,
}: StopSelectorProps) => {
  const [startStopIndex, setStartStopIndex] = useState<number | null>(null);

  // 시작 경유지 선택 시 그 이후 경유지들을 자동 선택
  const handleStartStopChange = (index: number) => {
    setStartStopIndex(index);
    const remainingStops = stops.slice(index);
    onStopsSelected(remainingStops);
  };

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-6 z-10 max-w-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        {friend.name}
        {friend.busRoute && ` / ${friend.busRoute.routeName}`}
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        친구가 지나갈 경유지 중 시작 지점을 선택하세요
      </p>

      {/* 드롭다운으로 시작 경유지 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          시작 경유지
        </label>
        <select
          value={startStopIndex ?? ''}
          onChange={(e) => handleStartStopChange(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">선택하세요</option>
          {stops.map((stop, index) => (
            <option key={stop.id} value={index}>
              {stop.sequence}. {stop.stopName}
            </option>
          ))}
        </select>
      </div>

      {/* 선택된 경유지 목록 표시 */}
      {selectedStops.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            선택된 경유지 ({selectedStops.length}개)
          </p>
          <div className="max-h-40 overflow-y-auto bg-gray-50 rounded p-2 space-y-1">
            {selectedStops.map((stop) => (
              <div
                key={stop.id}
                className="text-xs text-gray-700 p-1 bg-white rounded"
              >
                {stop.sequence}. {stop.stopName}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 계산 버튼 */}
      <Button
        fullWidth
        onClick={onCalculate}
        disabled={selectedStops.length === 0 || isCalculating}
        isLoading={isCalculating}
      >
        도착 시간 계산
      </Button>

      <p className="mt-3 text-xs text-gray-500">
        선택한 경유지부터 내 위치까지의 예상 시간을 계산합니다.
      </p>
    </div>
  );
};
