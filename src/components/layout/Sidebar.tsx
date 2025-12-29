import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Calendar,
  FolderOpen,
  Users,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Plus,
  MoreHorizontal,
  FileText,
  Edit2,
  Trash2,
  LogOut,
} from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { useMessengerStore } from '../../stores/messengerStore';

export default function Sidebar() {
  const location = useLocation();
  const { projects, posts, addProject, deleteProject, setSelectedProject } = useProjectStore();
  const { currentUser, logout } = useAuthStore();
  const { toggleMessenger, getUnreadCount } = useMessengerStore();
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ projectId: string; x: number; y: number } | null>(null);

  const unreadCount = currentUser ? getUnreadCount(currentUser.id) : 0;

  const menuItems = [
    { icon: Home, label: '홈', path: '/' },
    { icon: Calendar, label: '캘린더', path: '/calendar' },
    { icon: FolderOpen, label: '드라이브', path: '/drive' },
    { icon: Users, label: '팀원 관리', path: '/team' },
  ];

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleAddProject = () => {
    if (newProjectName.trim() && currentUser) {
      addProject({
        name: newProjectName.trim(),
        description: '',
        color: getRandomColor(),
        createdBy: currentUser.id,
      });
      setNewProjectName('');
      setShowNewProjectInput(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    setContextMenu({ projectId, x: e.clientX, y: e.clientY });
  };

  const getRandomColor = () => {
    const colors = ['#0073ea', '#00c875', '#fdab3d', '#e2445c', '#a25ddc', '#037f4c', '#579bfc'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getProjectPosts = (projectId: string) => {
    return posts.filter((p) => p.projectId === projectId);
  };

  return (
    <>
      <aside className="w-64 bg-sidebar-bg text-gray-300 flex flex-col h-screen">
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">TeamFlow</h1>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-sidebar-active text-white'
                      : 'hover:bg-sidebar-hover'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={toggleMessenger}
                className="flex items-center w-full px-3 py-2 rounded-lg transition-colors hover:bg-sidebar-hover"
              >
                <MessageSquare className="w-5 h-5 mr-3" />
                메신저
                {unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            </li>
          </ul>

          {/* Projects Section */}
          <div className="mt-6 px-2">
            <div className="flex items-center justify-between px-3 py-2 text-sm text-gray-400">
              <span>프로젝트</span>
              <button
                onClick={() => setShowNewProjectInput(true)}
                className="hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showNewProjectInput && (
              <div className="px-3 py-2">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddProject();
                    if (e.key === 'Escape') setShowNewProjectInput(false);
                  }}
                  onBlur={() => {
                    if (newProjectName.trim()) handleAddProject();
                    else setShowNewProjectInput(false);
                  }}
                  placeholder="프로젝트 이름"
                  className="w-full px-2 py-1 bg-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  autoFocus
                />
              </div>
            )}

            <ul className="space-y-1">
              {projects.map((project) => (
                <li key={project.id}>
                  <div
                    className="flex items-center px-3 py-2 rounded-lg hover:bg-sidebar-hover cursor-pointer group"
                    onClick={() => {
                      toggleProject(project.id);
                      setSelectedProject(project.id);
                    }}
                    onContextMenu={(e) => handleContextMenu(e, project.id)}
                  >
                    {expandedProjects.includes(project.id) ? (
                      <ChevronDown className="w-4 h-4 mr-2" />
                    ) : (
                      <ChevronRight className="w-4 h-4 mr-2" />
                    )}
                    <div
                      className="w-3 h-3 rounded mr-2"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="flex-1 truncate">{project.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e, project.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-white"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Project Posts */}
                  {expandedProjects.includes(project.id) && (
                    <ul className="ml-6 space-y-1">
                      {getProjectPosts(project.id).map((post) => (
                        <li key={post.id}>
                          <Link
                            to={`/project/${project.id}/post/${post.id}`}
                            className="flex items-center px-3 py-1.5 rounded hover:bg-sidebar-hover text-sm"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            <span className="truncate">{post.title}</span>
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          to={`/project/${project.id}`}
                          className="flex items-center px-3 py-1.5 rounded hover:bg-sidebar-hover text-sm text-gray-500"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          <span>게시글 추가</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <Link to="/profile" className="flex items-center flex-1 hover:bg-sidebar-hover rounded-lg p-2 -m-2">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                {currentUser?.name.charAt(0)}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {currentUser?.role}
                </p>
              </div>
            </Link>
            <button
              onClick={logout}
              className="p-2 hover:bg-sidebar-hover rounded-lg transition-colors"
              title="로그아웃"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              onClick={() => {
                setContextMenu(null);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              이름 변경
            </button>
            <button
              onClick={() => {
                deleteProject(contextMenu.projectId);
                setContextMenu(null);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              삭제
            </button>
          </div>
        </>
      )}
    </>
  );
}
