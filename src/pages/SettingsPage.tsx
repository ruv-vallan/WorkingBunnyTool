import { useState, useRef } from 'react';
import { Settings, Upload, Save, Palette, Building2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function SettingsPage() {
  const { teamSettings, updateTeamSettings, isAdmin } = useAuthStore();
  const [formData, setFormData] = useState({
    name: teamSettings.name,
    primaryColor: teamSettings.primaryColor,
    logo: teamSettings.logo,
  });
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAdmin()) {
    return (
      <div className="p-8 text-center">
        <Settings className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h2>
        <p className="text-gray-500">이 페이지는 관리자만 접근할 수 있습니다.</p>
      </div>
    );
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData({ ...formData, logo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateTeamSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const colorPresets = [
    '#0073ea', '#00c875', '#fdab3d', '#e2445c',
    '#a25ddc', '#037f4c', '#579bfc', '#ff642e',
    '#9d4edd', '#3d5a80', '#ee6c4d', '#118ab2',
  ];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">팀 설정</h1>
          <p className="text-gray-600 mt-1">팀 이름과 로고를 설정합니다</p>
        </div>
        <button
          onClick={handleSave}
          className="btn-primary flex items-center"
        >
          <Save className="w-5 h-5 mr-2" />
          저장
        </button>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
          설정이 저장되었습니다!
        </div>
      )}

      <div className="space-y-6">
        {/* Team Logo */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-primary-500" />
            팀 로고
          </h2>
          <div className="flex items-center space-x-6">
            <div
              className="w-24 h-24 rounded-xl flex items-center justify-center text-white text-3xl font-bold overflow-hidden"
              style={{ backgroundColor: formData.primaryColor }}
            >
              {formData.logo ? (
                <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                formData.name.charAt(0)
              )}
            </div>
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                로고 업로드
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <p className="text-sm text-gray-500 mt-2">PNG, JPG 최대 2MB</p>
              {formData.logo && (
                <button
                  onClick={() => setFormData({ ...formData, logo: '' })}
                  className="text-sm text-red-600 hover:text-red-800 mt-1"
                >
                  로고 제거
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Team Name */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-primary-500" />
            팀 이름
          </h2>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field max-w-md"
            placeholder="팀 이름을 입력하세요"
          />
          <p className="text-sm text-gray-500 mt-2">
            사이드바 상단에 표시되는 팀 이름입니다
          </p>
        </div>

        {/* Primary Color */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Palette className="w-5 h-5 mr-2 text-primary-500" />
            메인 컬러
          </h2>
          <div className="flex items-center space-x-4 mb-4">
            <div
              className="w-12 h-12 rounded-lg border-2 border-gray-200"
              style={{ backgroundColor: formData.primaryColor }}
            />
            <input
              type="text"
              value={formData.primaryColor}
              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              className="input-field w-32"
              placeholder="#0073ea"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {colorPresets.map((color) => (
              <button
                key={color}
                onClick={() => setFormData({ ...formData, primaryColor: color })}
                className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${
                  formData.primaryColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">미리보기</h2>
          <div className="bg-sidebar-bg rounded-lg p-4 max-w-xs">
            <div className="flex items-center">
              {formData.logo ? (
                <img src={formData.logo} alt="Logo" className="w-8 h-8 rounded mr-2" />
              ) : (
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-white font-bold mr-2"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  {formData.name.charAt(0)}
                </div>
              )}
              <span className="text-xl font-bold text-white">{formData.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
