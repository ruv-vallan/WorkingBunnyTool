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
  Shield,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useMessengerStore } from '../stores/messengerStore';
import { useProjectStore } from '../stores/projectStore';
import { User, UserPermissions } from '../types';

const ROLE_OPTIONS: { value: User['role']; label: string; description: string }[] = [
  { value: 'admin', label: '관리자', description: '모든 권한을 가진 최고 관리자' },
  { value: 'manager', label: '매니저', description: '프로젝트 관리 권한 보유' },
  { value: 'member', label: '팀원', description: '일반 팀원' },
  { value: 'guest', label: '게스트', description: '제한된 접근 권한' },
];

const getRoleLabel = (role: string) => {
  const option = ROLE_OPTIONS.find(o => o.value === role);
  return option?.label || role;
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-700';
    case 'manager': return 'bg-blue-100 text-blue-700';
    case 'member': return 'bg-green-100 text-green-700';
    case 'guest': return 'bg-gray-100 text-gray-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default function TeamPage() {
  const { users, currentUser, updateProfile, deleteUser, updateUserRole, updateUserPermissions } = useAuthStore();
  const { getOrCreateDirectChat, setActiveChat, openMessenger } = useMessengerStore();
  const { projects, posts } = useProjectStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionUser, setPermissionUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    role: '' as User['role'],
    department: '',
    phone: '',
    email: '',
    bio: '',
  });
  const [permissionForm, setPermissionForm] = useState<UserPermissions>({
    canManageTeam: false,
    canManageProjects: false,
    accessibleProjects: [],
    accessiblePosts: [],
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
      const { role, ...updateData } = editForm;
      updateProfile(editingUser.id, updateData);
      // Update role separately if it changed
      if (role !== editingUser.role) {
        updateUserRole(editingUser.id, role);
      }
      setShowEditModal(false);
      setEditingUser(null);
    }
  };

  const handleOpenPermissions = (user: User) => {
    setPermissionUser(user);
    setPermissionForm({
      canManageTeam: user.permissions?.canManageTeam || false,
      canManageProjects: user.permissions?.canManageProjects || false,
      accessibleProjects: user.permissions?.accessibleProjects || [],
      accessiblePosts: user.permissions?.accessiblePosts || [],
    });
    setShowPermissionModal(true);
  };

  const handleSavePermissions = () => {
    if (permissionUser) {
      updateUserPermissions(permissionUser.id, permissionForm);
      setShowPermissionModal(false);
      setPermissionUser(null);
    }
  };

  const toggleProjectAccess = (projectId: string) => {
    setPermissionForm(prev => ({
      ...prev,
      accessibleProjects: prev.accessibleProjects.includes(projectId)
        ? prev.accessibleProjects.filter(id => id !== projectId)
        : [...prev.accessibleProjects, projectId],
    }));
  };

  const togglePostAccess = (postId: string) => {
    setPermissionForm(prev => ({
      ...prev,
      accessiblePosts: prev.accessiblePosts.includes(postId)
        ? prev.accessiblePosts.filter(id => id !== postId)
        : [...prev.accessiblePosts, postId],
    }));
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

  const isAdmin = currentUser?.role === 'admin';

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
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary-500 text-white text-xl flex items-center justify-center font-medium">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>
              {isAdmin && user.id !== currentUser?.id && (
                <div className="relative group">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      편집
                    </button>
                    <button
                      onClick={() => handleOpenPermissions(user)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      권한 설정
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
                    setEditForm({ ...editForm, role: e.target.value as User['role'] })
                  }
                  className="input-field"
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {ROLE_OPTIONS.find(o => o.value === editForm.role)?.description}
                </p>
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

      {/* Permission Modal */}
      {showPermissionModal && permissionUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-primary-500 mr-2" />
                <h2 className="text-xl font-semibold">권한 설정</h2>
              </div>
              <button
                onClick={() => setShowPermissionModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center p-4 bg-gray-50 rounded-lg mb-6">
              {permissionUser.avatar ? (
                <img
                  src={permissionUser.avatar}
                  alt={permissionUser.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-500 text-white text-lg flex items-center justify-center font-medium">
                  {permissionUser.name.charAt(0)}
                </div>
              )}
              <div className="ml-3">
                <h3 className="font-semibold text-gray-900">{permissionUser.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(permissionUser.role)}`}>
                  {getRoleLabel(permissionUser.role)}
                </span>
              </div>
            </div>

            {/* General Permissions */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-1" />
                일반 권한
              </h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">팀 관리</p>
                    <p className="text-sm text-gray-500">팀원 초대 및 관리 권한</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissionForm.canManageTeam}
                    onChange={(e) =>
                      setPermissionForm({ ...permissionForm, canManageTeam: e.target.checked })
                    }
                    className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">프로젝트 관리</p>
                    <p className="text-sm text-gray-500">프로젝트 생성 및 수정 권한</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissionForm.canManageProjects}
                    onChange={(e) =>
                      setPermissionForm({ ...permissionForm, canManageProjects: e.target.checked })
                    }
                    className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>

            {/* Project Access */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                프로젝트 접근 권한
                <span className="font-normal text-gray-500 ml-2">
                  (비어있으면 모든 프로젝트 접근 가능)
                </span>
              </h4>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                {projects.length === 0 ? (
                  <p className="p-3 text-sm text-gray-500 text-center">프로젝트가 없습니다</p>
                ) : (
                  projects.map((project) => (
                    <label
                      key={project.id}
                      className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="text-sm">{project.name}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={permissionForm.accessibleProjects.includes(project.id)}
                        onChange={() => toggleProjectAccess(project.id)}
                        className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                      />
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Post Access */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                게시글 접근 권한
                <span className="font-normal text-gray-500 ml-2">
                  (비어있으면 모든 게시글 접근 가능)
                </span>
              </h4>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                {posts.length === 0 ? (
                  <p className="p-3 text-sm text-gray-500 text-center">게시글이 없습니다</p>
                ) : (
                  posts.map((post) => (
                    <label
                      key={post.id}
                      className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50"
                    >
                      <span className="text-sm">{post.title}</span>
                      <input
                        type="checkbox"
                        checked={permissionForm.accessiblePosts.includes(post.id)}
                        onChange={() => togglePostAccess(post.id)}
                        className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                      />
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="btn-secondary"
              >
                취소
              </button>
              <button onClick={handleSavePermissions} className="btn-primary flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                권한 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
