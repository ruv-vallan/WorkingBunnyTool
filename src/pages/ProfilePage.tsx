import { useState, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  Building,
  Save,
  Camera,
  Trash2,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import ImageCropper from '../components/common/ImageCropper';

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
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedImage(ev.target?.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    if (currentUser) {
      updateProfile(currentUser.id, { avatar: croppedImage });
    }
    setShowCropper(false);
    setSelectedImage(null);
  };

  const handleRemoveAvatar = () => {
    if (currentUser && window.confirm('프로필 사진을 삭제하시겠습니까?')) {
      updateProfile(currentUser.id, { avatar: '' });
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return '관리자';
      case 'manager': return '매니저';
      case 'member': return '팀원';
      case 'guest': return '게스트';
      default: return role;
    }
  };

  if (!currentUser) return null;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">내 프로필</h1>

      <div className="card p-8">
        {/* Avatar Section */}
        <div className="flex items-center mb-8">
          <div className="relative group">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-500 text-white text-3xl flex items-center justify-center font-medium">
                {formData.name.charAt(0)}
              </div>
            )}

            {/* Camera Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50"
              title="사진 변경"
            >
              <Camera className="w-4 h-4 text-gray-600" />
            </button>

            {/* Remove Button (shown on hover if avatar exists) */}
            {currentUser.avatar && (
              <button
                onClick={handleRemoveAvatar}
                className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="사진 삭제"
              >
                <Trash2 className="w-3 h-3 text-white" />
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
          <div className="ml-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {formData.name}
            </h2>
            <p className="text-gray-600">{getRoleLabel(currentUser.role)}</p>
            <p className="text-sm text-gray-500">{formData.department}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700"
            >
              프로필 사진 변경
            </button>
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
              value={getRoleLabel(currentUser.role)}
              disabled
              className="input-field bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">역할은 관리자만 변경할 수 있습니다</p>
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

      {/* Image Cropper Modal */}
      {showCropper && selectedImage && (
        <ImageCropper
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setSelectedImage(null);
          }}
          aspectRatio={1}
        />
      )}
    </div>
  );
}
