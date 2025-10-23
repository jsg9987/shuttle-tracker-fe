'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/common';
import { UserGroupIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export const Navbar = () => {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // 클라이언트에서만 렌더링 (hydration mismatch 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-600">SSAFY 셔틀</span>
          </Link>

          {/* 우측 메뉴 */}
          <div className="flex items-center gap-4">
            {!mounted ? (
              // 로딩 중 스켈레톤 (깜빡임 방지)
              <div className="flex gap-4">
                <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : isAuthenticated ? (
              <>
                {/* 로그인 완료 상태 */}
                <span className="text-sm text-gray-700 hidden sm:inline">
                  {user?.name}님
                </span>

                <button
                  onClick={() => router.push('/friends')}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                  title="친구 목록"
                >
                  <UserGroupIcon className="w-6 h-6" />
                  <span className="hidden sm:inline">친구</span>
                </button>

                <button
                  onClick={() => router.push('/mypage')}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                  title="마이페이지"
                >
                  <UserIcon className="w-6 h-6" />
                  <span className="hidden sm:inline">마이페이지</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-6 h-6" />
                  <span className="hidden sm:inline">로그아웃</span>
                </button>
              </>
            ) : (
              <>
                {/* 로그인 미완료 상태 */}
                <Button
                  variant="light"
                  onClick={() => router.push('/login')}
                >
                  로그인
                </Button>
                <Button
                  onClick={() => router.push('/signup')}
                >
                  회원가입
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
