'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, useToast, Toast } from '@/components/common';
import { signup } from '@/lib/api/auth';
import type { SignupRequest } from '@/types';

export default function SignupPage() {
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

  const [formData, setFormData] = useState<SignupRequest & { passwordConfirm: string }>({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
  });
  const [errors, setErrors] = useState<Partial<SignupRequest & { passwordConfirm: string }>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Validation
  const validate = (): boolean => {
    const newErrors: Partial<SignupRequest & { passwordConfirm: string }> = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요.';
    }

    if (!formData.name) {
      newErrors.name = '이름을 입력해주세요.';
    } else if (formData.name.length < 2) {
      newErrors.name = '이름은 최소 2자 이상이어야 합니다.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
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
      // 회원가입 API 호출
      await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });

      showToast('회원가입 성공! 로그인 페이지로 이동합니다.', 'success');

      // 로그인 페이지로 이동
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error: any) {
      console.error('Signup error:', error);

      // 백엔드 에러 메시지 추출
      const errorMessage = error?.message || '회원가입에 실패했습니다. 다시 시도해주세요.';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">회원가입</h1>
          <p className="mt-2 text-sm text-gray-600">
            SSAFY 셔틀 트래커 계정을 만드세요
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
              label="이름"
              type="text"
              placeholder="홍길동"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              error={errors.name}
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

            <Input
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.passwordConfirm}
              onChange={(e) =>
                setFormData({ ...formData, passwordConfirm: e.target.value })
              }
              error={errors.passwordConfirm}
              fullWidth
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
          >
            회원가입
          </Button>

          {/* Login link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                로그인
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
