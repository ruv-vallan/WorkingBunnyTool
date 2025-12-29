import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building,
  Save,
  Camera,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    department: currentUser?.department || '',
    role: currentUser?.role || '',
    bio: currentUser?.bio || '',
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (currentUser) {
      const { role, ...updateData } = formData;
      updateProfile(currentUser.id, updateData);
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">내 프로필</h1>

      <div className="card p-8">
        {/* Avatar Section */}
        <div className="flex items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary-500 text-white text-3xl flex items-center justify-center font-medium">
              {formData.name.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="ml-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {formData.name}
            </h2>
            <p className="text-gray-600">{formData.role}</p>
            <p className="text-sm text-gray-500">{formData.department}</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                이름
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className={`input-field ${!isEditing && 'bg-gray-50'}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                이메일
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className={`input-field ${!isEditing && 'bg-gray-50'}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                전화번호
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="010-0000-0000"
                className={`input-field ${!isEditing && 'bg-gray-50'}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Building className="w-4 h-4 inline mr-1" />
                부서
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={!isEditing}
                className={`input-field ${!isEditing && 'bg-gray-50'}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              역할
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={!isEditing}
              className={`input-field ${!isEditing && 'bg-gray-50'}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              자기소개
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing}
              rows={4}
              placeholder="간단한 자기소개를 작성해주세요"
              className={`input-field resize-none ${!isEditing && 'bg-gray-50'}`}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          {saved && (
            <span className="text-green-600 text-sm">저장되었습니다!</span>
          )}
          <div className="flex space-x-2 ml-auto">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: currentUser.name,
                      email: currentUser.email,
                      phone: currentUser.phone,
                      department: currentUser.department,
                      role: currentUser.role,
                      bio: currentUser.bio,
                    });
                  }}
                  className="btn-secondary"
                >
                  취소
                </button>
                <button onClick={handleSave} className="btn-primary flex items-center">
                  <Save className="w-4 h-4 mr-1" />
                  저장
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary"
              >
                편집
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info Card */}
      <div className="card p-6 mt-6">
        <h3 className="font-semibold text-gray-900 mb-4">연락처 정보</h3>
        <p className="text-sm text-gray-600 mb-4">
          이 정보는 팀원들이 급하게 연락해야 할 때 사용됩니다.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-primary-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">이메일</p>
              <p className="font-medium">{formData.email || '미등록'}</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Phone className="w-5 h-5 text-primary-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">전화번호</p>
              <p className="font-medium">{formData.phone || '미등록'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
