import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Mail, ArrowLeft } from 'lucide-react';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
}

export default function ForgotPasswordForm({ onSwitchToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const findPassword = useAuthStore((state) => state.findPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setResult({ success: false, message: '이메일을 입력해주세요.' });
      return;
    }

    const password = findPassword(email);
    if (password) {
      setResult({
        success: true,
        message: `비밀번호: ${password}\n(실제 서비스에서는 이메일로 발송됩니다)`
      });
    } else {
      setResult({ success: false, message: '등록되지 않은 이메일입니다.' });
    }
  };

  return (
    <div className="w-full max-w-md">
      <button
        onClick={onSwitchToLogin}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        로그인으로 돌아가기
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">비밀번호 찾기</h1>
        <p className="text-gray-600">가입한 이메일을 입력하면 비밀번호를 알려드립니다</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이메일
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field pl-10"
              placeholder="가입한 이메일을 입력하세요"
            />
          </div>
        </div>

        {result && (
          <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p className="whitespace-pre-line">{result.message}</p>
          </div>
        )}

        <button type="submit" className="btn-primary w-full">
          비밀번호 찾기
        </button>
      </form>
    </div>
  );
}
