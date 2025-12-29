import { useState } from 'react';
import {
  Shield,
  Search,
  ChevronDown,
  Check,
  Users,
  FolderOpen,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useProjectStore } from '../stores/projectStore';
import { User } from '../types';

export default function PermissionsPage() {
  const { users, currentUser, updateUserRole, updateUserPermissions, isAdmin } = useAuthStore();
  const { projects } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (!isAdmin()) {
    return (
      <div className="p-8 text-center">
        <Shield className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h2>
        <p className="text-gray-500">이 페이지는 관리자만 접근할 수 있습니다.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleLabels: Record<string, string> = {
    admin: '관리자',
    manager: '매니저',
    member: '팀원',
    guest: '게스트',
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    manager: 'bg-blue-100 text-blue-700',
    member: 'bg-green-100 text-green-700',
    guest: 'bg-gray-100 text-gray-700',
  };

  const handleRoleChange = (userId: string, role: User['role']) => {
    updateUserRole(userId, role);
  };

  const toggleProjectAccess = (userId: string, projectId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const currentAccess = user.permissions.accessibleProjects;
    const newAccess = currentAccess.includes(projectId)
      ? currentAccess.filter((id) => id !== projectId)
      : [...currentAccess, projectId];

    updateUserPermissions(userId, { accessibleProjects: newAccess });
  };

  const toggleAllProjectAccess = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (user.permissions.accessibleProjects.length === 0) {
      updateUserPermissions(userId, { accessibleProjects: projects.map((p) => p.id) });
    } else {
      updateUserPermissions(userId, { accessibleProjects: [] });
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">권한 설정</h1>
          <p className="text-gray-600 mt-1">팀원별 접근 권한을 관리합니다</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      팀원
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      역할
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      프로젝트 접근
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-medium">
                            {user.name.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as User['role'])}
                            disabled={user.id === currentUser?.id}
                            className={`appearance-none px-3 py-1.5 pr-8 rounded-full text-sm font-medium cursor-pointer ${
                              roleColors[user.role]
                            } border-0 focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <option value="admin">관리자</option>
                            <option value="manager">매니저</option>
                            <option value="member">팀원</option>
                            <option value="guest">게스트</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.role === 'admin' || user.role === 'manager' ? (
                          <span className="text-sm text-gray-500">전체 접근</span>
                        ) : (
                          <span className="text-sm text-gray-600">
                            {user.permissions.accessibleProjects.length === 0
                              ? '전체'
                              : `${user.permissions.accessibleProjects.length}개 프로젝트`}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.role !== 'admin' && user.role !== 'manager' && (
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                          >
                            설정
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Permission Details */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary-500" />
            권한 상세 설정
          </h2>

          {selectedUser ? (
            <div>
              <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-medium text-lg">
                  {selectedUser.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{selectedUser.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[selectedUser.role]}`}>
                    {roleLabels[selectedUser.role]}
                  </span>
                </div>
              </div>

              {/* Project Access */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 flex items-center">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    프로젝트 접근 권한
                  </h3>
                  <button
                    onClick={() => toggleAllProjectAccess(selectedUser.id)}
                    className="text-xs text-primary-600 hover:text-primary-800"
                  >
                    {selectedUser.permissions.accessibleProjects.length === 0 ? '전체 선택' : '전체 해제'}
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {projects.length === 0 ? (
                    <p className="text-sm text-gray-500">프로젝트가 없습니다</p>
                  ) : (
                    projects.map((project) => {
                      const hasAccess =
                        selectedUser.permissions.accessibleProjects.length === 0 ||
                        selectedUser.permissions.accessibleProjects.includes(project.id);
                      return (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded mr-2"
                              style={{ backgroundColor: project.color }}
                            />
                            <span className="text-sm text-gray-700">{project.name}</span>
                          </div>
                          <button
                            onClick={() => toggleProjectAccess(selectedUser.id, project.id)}
                            className={`w-5 h-5 rounded flex items-center justify-center ${
                              hasAccess
                                ? 'bg-primary-500 text-white'
                                : 'border-2 border-gray-300'
                            }`}
                          >
                            {hasAccess && <Check className="w-3 h-3" />}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="w-full btn-secondary"
              >
                닫기
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">팀원을 선택하여</p>
              <p className="text-gray-500">권한을 설정하세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
