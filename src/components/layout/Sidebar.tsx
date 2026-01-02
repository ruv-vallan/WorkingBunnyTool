import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  CheckSquare,
  Settings,
  LayoutGrid,
  BarChart3,
  ClipboardList,
  GitBranch,
  Folder,
  GripVertical,
} from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { useMessengerStore } from '../../stores/messengerStore';
import { PostType, Project, Post } from '../../types';
import AddPostModal from '../projects/AddPostModal';

const postTypeIcons: Record<string, React.ElementType> = {
  board: LayoutGrid,
  document: FileText,
  dashboard: BarChart3,
  form: ClipboardList,
  workflow: GitBranch,
  folder: Folder,
};

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { projects, posts, addProject, addPost, deleteProject, setSelectedProject, updateProject, reorderProjects, movePost, reorderPosts } = useProjectStore();
  const { currentUser, logout, teamSettings, isAdmin } = useAuthStore();
  const { toggleMessenger, getUnreadCount } = useMessengerStore();
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ projectId: string; x: number; y: number } | null>(null);
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [selectedProjectForPost, setSelectedProjectForPost] = useState<string | null>(null);

  // 프로젝트 이름 편집 상태
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // 드래그앤드롭 상태
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);
  const [draggedPost, setDraggedPost] = useState<Post | null>(null);
  const [dragOverProjectId, setDragOverProjectId] = useState<string | null>(null);
  const [dragOverPostId, setDragOverPostId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);

  const unreadCount = currentUser ? getUnreadCount(currentUser.id) : 0;
  const isCurrentUserAdmin = isAdmin();

  // 편집 모드 시 input에 포커스
  useEffect(() => {
    if (editingProjectId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingProjectId]);

  const menuItems = [
    { icon: Home, label: '홈', path: '/' },
    { icon: CheckSquare, label: '내 작업', path: '/my-work' },
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
    return posts.filter((p) => p.projectId === projectId).sort((a, b) => a.order - b.order);
  };

  // 프로젝트 이름 편집 시작
  const startEditingProject = (project: Project) => {
    setEditingProjectId(project.id);
    setEditingProjectName(project.name);
    setContextMenu(null);
  };

  // 프로젝트 이름 편집 완료
  const finishEditingProject = () => {
    if (editingProjectId && editingProjectName.trim()) {
      updateProject(editingProjectId, { name: editingProjectName.trim() });
    }
    setEditingProjectId(null);
    setEditingProjectName('');
  };

  // 프로젝트 이름 편집 취소
  const cancelEditingProject = () => {
    setEditingProjectId(null);
    setEditingProjectName('');
  };

  // 프로젝트 드래그 시작
  const handleProjectDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project);
    setDraggedPost(null);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', project.id);
  };

  // 프로젝트 드래그 오버
  const handleProjectDragOver = (e: React.DragEvent, projectId: string) => {
    e.preventDefault();
    if (draggedProject && draggedProject.id !== projectId) {
      setDragOverProjectId(projectId);

      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const y = e.clientY - rect.top;
      const height = rect.height;

      if (y < height / 2) {
        setDropPosition('before');
      } else {
        setDropPosition('after');
      }
    }
    if (draggedPost) {
      setDragOverProjectId(projectId);
      setDropPosition('inside');
    }
  };

  // 프로젝트 드래그 리브
  const handleProjectDragLeave = () => {
    setDragOverProjectId(null);
    setDropPosition(null);
  };

  // 프로젝트 드롭
  const handleProjectDrop = (e: React.DragEvent, targetProjectId: string) => {
    e.preventDefault();

    if (draggedProject && draggedProject.id !== targetProjectId) {
      const sortedProjects = [...projects].sort((a, b) => a.order - b.order);
      const draggedIndex = sortedProjects.findIndex(p => p.id === draggedProject.id);
      const targetIndex = sortedProjects.findIndex(p => p.id === targetProjectId);

      const newProjects = [...sortedProjects];
      newProjects.splice(draggedIndex, 1);

      let insertIndex = targetIndex;
      if (dropPosition === 'after') {
        insertIndex = draggedIndex < targetIndex ? targetIndex : targetIndex + 1;
      } else {
        insertIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
      }

      newProjects.splice(insertIndex, 0, draggedProject);

      // 순서 업데이트
      const reorderedProjects = newProjects.map((p, index) => ({ ...p, order: index }));
      reorderProjects(reorderedProjects);
    }

    // Post를 다른 프로젝트로 이동
    if (draggedPost && draggedPost.projectId !== targetProjectId) {
      movePost(draggedPost.id, targetProjectId);
    }

    setDraggedProject(null);
    setDraggedPost(null);
    setDragOverProjectId(null);
    setDropPosition(null);
  };

  // 프로젝트 드래그 종료
  const handleProjectDragEnd = () => {
    setDraggedProject(null);
    setDragOverProjectId(null);
    setDropPosition(null);
  };

  // Post 드래그 시작
  const handlePostDragStart = (e: React.DragEvent, post: Post) => {
    e.stopPropagation();
    setDraggedPost(post);
    setDraggedProject(null);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', post.id);
  };

  // Post 드래그 오버
  const handlePostDragOver = (e: React.DragEvent, postId: string, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedPost && draggedPost.id !== postId) {
      setDragOverPostId(postId);
      setDragOverProjectId(projectId);

      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const y = e.clientY - rect.top;
      const height = rect.height;

      if (y < height / 2) {
        setDropPosition('before');
      } else {
        setDropPosition('after');
      }
    }
  };

  // Post 드래그 리브
  const handlePostDragLeave = () => {
    setDragOverPostId(null);
    setDropPosition(null);
  };

  // Post 드롭
  const handlePostDrop = (e: React.DragEvent, targetPostId: string, targetProjectId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedPost && draggedPost.id !== targetPostId) {
      const projectPosts = getProjectPosts(targetProjectId);
      const draggedIndex = projectPosts.findIndex(p => p.id === draggedPost.id);
      const targetIndex = projectPosts.findIndex(p => p.id === targetPostId);

      // 같은 프로젝트 내에서 이동
      if (draggedPost.projectId === targetProjectId) {
        const newPosts = [...projectPosts];
        newPosts.splice(draggedIndex, 1);

        let insertIndex = targetIndex;
        if (dropPosition === 'after') {
          insertIndex = draggedIndex < targetIndex ? targetIndex : targetIndex + 1;
        } else {
          insertIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
        }

        newPosts.splice(insertIndex, 0, draggedPost);

        // 순서 업데이트
        const reorderedPosts = posts.map(p => {
          const newOrderPost = newPosts.find(np => np.id === p.id);
          if (newOrderPost) {
            return { ...p, order: newPosts.indexOf(newOrderPost) };
          }
          return p;
        });
        reorderPosts(reorderedPosts);
      } else {
        // 다른 프로젝트로 이동
        movePost(draggedPost.id, targetProjectId);
      }
    }

    setDraggedPost(null);
    setDragOverPostId(null);
    setDragOverProjectId(null);
    setDropPosition(null);
  };

  // Post 드래그 종료
  const handlePostDragEnd = () => {
    setDraggedPost(null);
    setDragOverPostId(null);
    setDragOverProjectId(null);
    setDropPosition(null);
  };

  const handleAddPostClick = (projectId: string) => {
    setSelectedProjectForPost(projectId);
    setShowAddPostModal(true);
  };

  const handlePostTypeSelect = (type: PostType, title: string) => {
    if (selectedProjectForPost && currentUser) {
      const newPost = addPost({
        projectId: selectedProjectForPost,
        title,
        content: '',
        type,
        status: 'todo',
        priority: 'medium',
        assignees: [],
        createdBy: currentUser.id,
      });
      navigate(`/project/${selectedProjectForPost}/post/${newPost.id}`);
    }
    setShowAddPostModal(false);
    setSelectedProjectForPost(null);
  };

  const getPostIcon = (type: PostType | undefined) => {
    if (!type) return FileText;
    return postTypeIcons[type] || FileText;
  };

  return (
    <>
      <aside className="w-64 bg-gradient-to-b from-sidebar-bg to-[#0f0a14] text-gray-300 flex flex-col h-screen border-r border-sidebar-border">
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <Link to={isCurrentUserAdmin ? '/settings' : '/'} className="flex items-center group">
            {teamSettings.logo ? (
              <img src={teamSettings.logo} alt="Logo" className="w-9 h-9 rounded-lg mr-3 shadow-glow-pink" />
            ) : (
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold mr-3 bg-gradient-to-br from-primary-500 to-accent-orange shadow-glow-pink"
              >
                {teamSettings.name.charAt(0)}
              </div>
            )}
            <h1 className="text-xl font-bold text-gradient-thermal group-hover:opacity-80 transition-opacity">
              {teamSettings.name}
            </h1>
            {isCurrentUserAdmin && (
              <Edit2 className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-primary-400" />
            )}
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                    location.pathname === item.path
                      ? 'bg-sidebar-active text-white border-l-2 border-primary-500 shadow-[inset_0_0_20px_rgba(255,0,110,0.15)]'
                      : 'hover:bg-sidebar-hover hover:shadow-[inset_0_0_15px_rgba(255,0,110,0.1)]'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${location.pathname === item.path ? 'text-primary-400' : ''}`} />
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={toggleMessenger}
                className="flex items-center w-full px-3 py-2 rounded-lg transition-all hover:bg-sidebar-hover hover:shadow-[inset_0_0_15px_rgba(255,0,110,0.1)]"
              >
                <MessageSquare className="w-5 h-5 mr-3" />
                메신저
                {unreadCount > 0 && (
                  <span className="ml-auto bg-gradient-to-r from-primary-500 to-accent-orange text-white text-xs px-2 py-0.5 rounded-full shadow-glow-pink">
                    {unreadCount}
                  </span>
                )}
              </button>
            </li>
          </ul>

          {/* Projects Section */}
          <div className="mt-6 px-2">
            <div className="flex items-center justify-between px-3 py-2 text-sm text-gray-500">
              <span className="uppercase tracking-wider text-xs font-semibold">프로젝트</span>
              <button
                onClick={() => setShowNewProjectInput(true)}
                className="hover:text-primary-400 transition-colors"
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
                  className="w-full px-2 py-1 bg-dark-card border border-sidebar-border rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  autoFocus
                />
              </div>
            )}

            <ul className="space-y-1">
              {[...projects].sort((a, b) => a.order - b.order).map((project) => (
                <li
                  key={project.id}
                  draggable={editingProjectId !== project.id}
                  onDragStart={(e) => handleProjectDragStart(e, project)}
                  onDragOver={(e) => handleProjectDragOver(e, project.id)}
                  onDragLeave={handleProjectDragLeave}
                  onDrop={(e) => handleProjectDrop(e, project.id)}
                  onDragEnd={handleProjectDragEnd}
                  className={`${draggedProject?.id === project.id ? 'opacity-50' : ''}`}
                >
                  <div
                    className={`flex items-center px-3 py-2 rounded-lg hover:bg-sidebar-hover cursor-pointer group transition-all
                      ${dragOverProjectId === project.id && draggedProject ?
                        (dropPosition === 'before' ? 'border-t-2 border-primary-500' : 'border-b-2 border-primary-500') : ''}
                      ${dragOverProjectId === project.id && draggedPost ? 'ring-2 ring-primary-500 bg-sidebar-hover' : ''}
                    `}
                    onClick={() => {
                      if (editingProjectId !== project.id) {
                        toggleProject(project.id);
                        setSelectedProject(project.id);
                      }
                    }}
                    onContextMenu={(e) => handleContextMenu(e, project.id)}
                    onDoubleClick={() => startEditingProject(project)}
                  >
                    {/* 드래그 핸들 */}
                    <div
                      className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing mr-1 hover:text-white"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="w-3 h-3" />
                    </div>
                    {expandedProjects.includes(project.id) ? (
                      <ChevronDown className="w-4 h-4 mr-2" />
                    ) : (
                      <ChevronRight className="w-4 h-4 mr-2" />
                    )}
                    <div
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0 shadow-lg"
                      style={{ backgroundColor: project.color, boxShadow: `0 0 8px ${project.color}` }}
                    />
                    {editingProjectId === project.id ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingProjectName}
                        onChange={(e) => setEditingProjectName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') finishEditingProject();
                          if (e.key === 'Escape') cancelEditingProject();
                        }}
                        onBlur={finishEditingProject}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-dark-card border border-sidebar-border rounded px-2 py-0.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      />
                    ) : (
                      <span className="flex-1 truncate">{project.name}</span>
                    )}
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
                      {getProjectPosts(project.id).map((post) => {
                        const PostIcon = getPostIcon(post.type);
                        return (
                          <li
                            key={post.id}
                            draggable
                            onDragStart={(e) => handlePostDragStart(e, post)}
                            onDragOver={(e) => handlePostDragOver(e, post.id, project.id)}
                            onDragLeave={handlePostDragLeave}
                            onDrop={(e) => handlePostDrop(e, post.id, project.id)}
                            onDragEnd={handlePostDragEnd}
                            className={`${draggedPost?.id === post.id ? 'opacity-50' : ''}`}
                          >
                            <Link
                              to={`/project/${project.id}/post/${post.id}`}
                              className={`flex items-center px-3 py-1.5 rounded hover:bg-sidebar-hover text-sm group transition-all
                                ${dragOverPostId === post.id ?
                                  (dropPosition === 'before' ? 'border-t-2 border-primary-500' : 'border-b-2 border-primary-500') : ''}
                              `}
                            >
                              {/* 드래그 핸들 */}
                              <div
                                className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing mr-1 hover:text-white"
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <GripVertical className="w-3 h-3" />
                              </div>
                              <PostIcon className="w-4 h-4 mr-2" />
                              <span className="truncate">{post.title}</span>
                            </Link>
                          </li>
                        );
                      })}
                      <li>
                        <button
                          onClick={() => handleAddPostClick(project.id)}
                          className="flex items-center w-full px-3 py-1.5 rounded hover:bg-sidebar-hover text-sm text-gray-500"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          <span>항목 추가</span>
                        </button>
                      </li>
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Admin Settings - Above User Section */}
        {isCurrentUserAdmin && (
          <div className="px-2 pb-2">
            <Link
              to="/settings"
              className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                location.pathname === '/settings'
                  ? 'bg-sidebar-active text-white border-l-2 border-primary-500 shadow-[inset_0_0_20px_rgba(255,0,110,0.15)]'
                  : 'hover:bg-sidebar-hover hover:shadow-[inset_0_0_15px_rgba(255,0,110,0.1)]'
              }`}
            >
              <Settings className={`w-5 h-5 mr-3 ${location.pathname === '/settings' ? 'text-primary-400' : ''}`} />
              설정
            </Link>
          </div>
        )}

        {/* User Section */}
        <div className="border-t border-sidebar-border p-4 bg-gradient-to-t from-[#0a0510] to-transparent">
          <div className="flex items-center justify-between">
            <Link to="/profile" className="flex items-center flex-1 hover:bg-sidebar-hover rounded-lg p-2 -m-2 transition-all">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-500/30"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-orange flex items-center justify-center text-white font-medium shadow-glow-pink">
                  {currentUser?.name.charAt(0)}
                </div>
              )}
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-primary-400/70 truncate">
                  {currentUser?.role === 'admin' ? '관리자' :
                   currentUser?.role === 'manager' ? '매니저' :
                   currentUser?.role === 'member' ? '팀원' : '게스트'}
                </p>
              </div>
            </Link>
            <button
              onClick={logout}
              className="p-2 hover:bg-sidebar-hover rounded-lg transition-all hover:text-primary-400"
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
            className="fixed z-50 bg-dark-card rounded-lg shadow-xl border border-sidebar-border py-1 min-w-[160px] backdrop-blur-sm"
            style={{ top: contextMenu.y, left: contextMenu.x, boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 0, 110, 0.1)' }}
          >
            <button
              onClick={() => {
                const project = projects.find(p => p.id === contextMenu.projectId);
                if (project) {
                  startEditingProject(project);
                  // 프로젝트가 축소되어 있으면 확장
                  if (!expandedProjects.includes(project.id)) {
                    setExpandedProjects(prev => [...prev, project.id]);
                  }
                }
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-sidebar-hover hover:text-white transition-colors"
            >
              <Edit2 className="w-4 h-4 mr-2 text-primary-400" />
              이름 변경
            </button>
            <button
              onClick={() => {
                deleteProject(contextMenu.projectId);
                setContextMenu(null);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              삭제
            </button>
          </div>
        </>
      )}

      {/* Add Post Modal */}
      <AddPostModal
        isOpen={showAddPostModal}
        onClose={() => {
          setShowAddPostModal(false);
          setSelectedProjectForPost(null);
        }}
        onSelect={handlePostTypeSelect}
      />
    </>
  );
}
