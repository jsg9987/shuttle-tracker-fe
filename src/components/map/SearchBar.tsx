'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Friend, ShuttleRoute, SearchResult } from '@/types';

interface SearchBarProps {
  friends: Friend[];
  routes: ShuttleRoute[];
  onSelectFriend: (friend: Friend) => void;
  onSelectRoute: (route: ShuttleRoute) => void;
}

export const SearchBar = ({
  friends,
  routes,
  onSelectFriend,
  onSelectRoute,
}: SearchBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  // 검색어 변경 시 실시간 검색
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];

    // 친구 검색
    friends.forEach((friend) => {
      if (friend.name.toLowerCase().includes(query.toLowerCase())) {
        searchResults.push({
          type: 'friend',
          id: friend.id,
          name: friend.name,
          data: friend,
        });
      }
    });

    // 노선 검색
    routes.forEach((route) => {
      if (route.routeName.toLowerCase().includes(query.toLowerCase())) {
        searchResults.push({
          type: 'route',
          id: route.id,
          name: route.routeName,
          data: route,
        });
      }
    });

    setResults(searchResults);
  }, [query, friends, routes]);

  const handleSelect = (result: SearchResult) => {
    if (result.type === 'friend') {
      onSelectFriend(result.data as Friend);
    } else {
      onSelectRoute(result.data as ShuttleRoute);
    }
    setIsOpen(false);
    setQuery('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors z-10"
      >
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
        <span className="text-gray-700">친구 또는 노선 검색</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4">
        {/* 검색 입력 */}
        <div className="flex items-center gap-3 p-4 border-b">
          <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
          <input
            type="text"
            placeholder="친구 이름 또는 노선명 입력..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 outline-none text-lg"
          />
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* 검색 결과 */}
        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 && query.trim() && (
            <div className="p-8 text-center text-gray-500">
              검색 결과가 없습니다.
            </div>
          )}

          {results.length === 0 && !query.trim() && (
            <div className="p-8 text-center text-gray-400">
              친구 이름 또는 노선명을 입력하세요
            </div>
          )}

          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors border-b last:border-b-0"
            >
              <div className="flex items-center gap-3">
                {result.type === 'friend' ? (
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">
                      {result.name[0]}
                    </span>
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">노</span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{result.name}</p>
                  <p className="text-sm text-gray-500">
                    {result.type === 'friend' ? '친구' : '노선'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
