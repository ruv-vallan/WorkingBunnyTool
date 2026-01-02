import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}

export default function LoginForm({ onSwitchToRegister, onSwitchToForgot }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const teamSettings = useAuthStore((state) => state.teamSettings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    const success = login(email, password);
    if (!success) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          {teamSettings.logo ? (
            <img src={teamSettings.logo} alt="Logo" className="w-16 h-16 rounded-xl shadow-glow-pink" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-accent-orange flex items-center justify-center text-white text-2xl font-bold shadow-glow-pink">
              {teamSettings.name.charAt(0)}
            </div>
          )}
        </div>
        <h1 className="text-3xl font-bold text-gradient-thermal mb-2">{teamSettings.name}</h1>
        <p className="text-gray-400">팀과 함께 더 효율적으로 일하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            이메일
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field pl-10"
              placeholder="이메일을 입력하세요"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            비밀번호
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-10 pr-10"
              placeholder="비밀번호를 입력하세요"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-400 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
        )}

        <button type="submit" className="btn-primary w-full">
          로그인
        </button>

        <div className="flex justify-between text-sm">
          <button
            type="button"
            onClick={onSwitchToForgot}
            className="text-primary-400 hover:text-primary-300 transition-colors"
          >
            비밀번호를 잊으셨나요?
          </button>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary-400 hover:text-primary-300 transition-colors"
          >
            계정 만들기
          </button>
        </div>
      </form>

      <div className="mt-8 text-center text-sm text-gray-500 bg-dark-bg/50 rounded-lg p-3 border border-dark-border">
        <p>테스트 계정: admin@hopping.com / admin123</p>
      </div>
    </div>
  );
}
