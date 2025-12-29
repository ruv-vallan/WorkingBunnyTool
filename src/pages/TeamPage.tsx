import { useState } from 'react';
import {
  Search,
  MoreVertical,
  Mail,
  Phone,
  Building,
  Edit2,
  Trash2,
  X,
  MessageSquare,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useMessengerStore } from '../stores/messengerStore';
import { User } from '../types';

export default function TeamPage() {
  const { users, currentUser, updateProfile, deleteUser } = useAuthStore();
  const { getOrCreateDirectChat, setActiveChat, openMessenger } = useMessengerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    role: '',
    department: '',
    phone: '',
    email: '',
    bio: '',
  });

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      role: user.role,
      department: user.department,
      phone: user.phone,
      email: user.email,
      bio: user.bio,
    });
    setShowEditModal(true);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      updateProfile(editingUser.id, editForm);
      setShowEditModal(false);
      setEditingUser(null);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('정말 이 팀원을 삭제하시겠습니까?')) {
      deleteUser(userId);
    }
  };

  const handleStartChat = (userId: string) => {
    if (currentUser) {
      const chat = getOrCreateDirectChat(currentUser.id, userId);
      setActiveChat(chat.id);
      openMessenger();
    }
  };

  const roles = ['관리자', '팀장', '팀원', '인턴'];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">팀원 관리</h1>
          <p className="text-gray-600 mt-1">총 {users.length}명의 팀원</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="팀원 검색..."
            className="input-field pl-10 w-64"
          />
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="card p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-14 h-14 rounded-full bg-primary-500 text-white text-xl flex items-center justify-center font-medium">
                  {user.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <span className="text-sm text-primary-600 font-medium">
                    {user.role}
                  </span>
                </div>
              </div>
              {currentUser?.role === '관리자' && user.id !== currentUser?.id && (
                <div className="relative group">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      편집
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      삭제
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-600">
              {user.department && (
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2 text-gray-400" />
                  {user.department}
                </div>
              )}
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                {user.email}
              </div>
              {user.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {user.phone}
                </div>
              )}
            </div>

            {user.bio && (
              <p className="mt-4 text-sm text-gray-500 line-clamp-2">{user.bio}</p>
            )}

            {user.id !== currentUser?.id && (
              <button
                onClick={() => handleStartChat(user.id)}
                className="mt-4 w-full btn-secondary flex items-center justify-center"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                메시지 보내기
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">팀원 정보 편집</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  역할
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                  className="input-field"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  부서
                </label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) =>
                    setEditForm({ ...editForm, department: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  소개
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                  className="input-field resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn-secondary"
              >
                취소
              </button>
              <button onClick={handleSaveUser} className="btn-primary">
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
