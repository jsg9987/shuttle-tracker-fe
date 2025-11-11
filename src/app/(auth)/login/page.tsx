'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, useToast, Toast } from '@/components/common';
import { useAuthStore } from '@/stores';
import { login } from '@/lib/api/auth';
import type { LoginRequest, User } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toasts, showToast, removeToast } = useToast();

  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginRequest>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Validation
  const validate = (): boolean => {
    const newErrors: Partial<LoginRequest> = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      // 1. 로그인 API 호출 (모든 사용자 정보 포함)
      const authResponse = await login(formData);

      // 2. User 객체 생성
      const user: User = {
        email: authResponse.email,
        name: authResponse.name,
        locationShareAgree: authResponse.locationShareAgree,
      };

      // 3. Zustand에 사용자 정보 및 토큰 저장 (자동으로 localStorage에 저장됨)
      setAuth(user, authResponse.accessToken);

      showToast('로그인 성공!', 'success');

      // 홈으로 이동
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error: any) {
      console.error('Login error:', error);

      // 백엔드 에러 메시지 추출
      const errorMessage = error?.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">SSAFY 셔틀 트래커</h1>
          <p className="mt-2 text-sm text-gray-600">
            계정에 로그인하여 셔틀 버스 위치를 확인하세요
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow">
          <div className="space-y-4">
            <Input
              label="이메일"
              type="email"
              placeholder="example@ssafy.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              error={errors.email}
              fullWidth
              disabled={isLoading}
            />

            <Input
              label="비밀번호"
              type="password"
              placeholder="최소 6자 이상"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              error={errors.password}
              fullWidth
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
          >
            로그인
          </Button>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link
                href="/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                회원가입
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
