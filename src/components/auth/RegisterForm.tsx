import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Mail, Lock, User, Phone, Building, Eye, EyeOff } from 'lucide-react';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    department: '',
    role: 'member' as const,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const register = useAuthStore((state) => state.register);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.name) {
      setError('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    const success = register({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone,
      department: formData.department,
      role: formData.role,
      avatar: '',
      bio: '',
    });

    if (!success) {
      setError('이미 등록된 이메일입니다.');
    }
  };

  const teamSettings = useAuthStore((state) => state.teamSettings);

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
        <h1 className="text-3xl font-bold text-gradient-thermal mb-2">계정 만들기</h1>
        <p className="text-gray-400">{teamSettings.name}에 가입하고 팀과 협업하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            이름 <span className="text-primary-400">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="이름을 입력하세요"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            이메일 <span className="text-primary-400">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="이메일을 입력하세요"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              비밀번호 <span className="text-primary-400">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field pl-10 pr-10"
                placeholder="비밀번호"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              비밀번호 확인 <span className="text-primary-400">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="비밀번호 확인"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            전화번호
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="010-0000-0000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            부서
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="소속 부서"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
        )}

        <button type="submit" className="btn-primary w-full">
          가입하기
        </button>

        <div className="text-center text-sm">
          <span className="text-gray-500">이미 계정이 있으신가요?</span>{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            로그인
          </button>
        </div>
      </form>
    </div>
  );
}
