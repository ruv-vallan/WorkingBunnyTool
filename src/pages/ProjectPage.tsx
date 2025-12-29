import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Calendar,
  Flag,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import { useAuthStore } from '../stores/authStore';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Post } from '../types';

export default function ProjectPage() {
  const { projectId } = useParams();
  const { projects, posts, addPost, updatePost, deletePost, updateProject } =
    useProjectStore();
  const { users, currentUser } = useAuthStore();

  const project = projects.find((p) => p.id === projectId);
  const projectPosts = posts
    .filter((p) => p.projectId === projectId)
    .sort((a, b) => a.order - b.order);

  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    status: 'todo' as Post['status'],
    priority: 'medium' as Post['priority'],
    assignees: [] as string[],
    dueDate: '',
  });
  const [editingTitle, setEditingTitle] = useState(false);
  const [projectTitle, setProjectTitle] = useState(project?.name || '');

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">프로젝트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const statusColors = {
    todo: 'bg-gray-100 text-gray-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    done: 'bg-green-100 text-green-700',
  };

  const statusLabels = {
    todo: '대기',
    'in-progress': '진행 중',
    done: '완료',
  };

  const priorityColors = {
    low: 'text-gray-400',
    medium: 'text-yellow-500',
    high: 'text-red-500',
  };

  const handleAddPost = () => {
    setEditingPost(null);
    setPostForm({
      title: '',
      content: '',
      status: 'todo',
      priority: 'medium',
      assignees: [],
      dueDate: '',
    });
    setShowPostModal(true);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      content: post.content,
      status: post.status,
      priority: post.priority,
      assignees: post.assignees,
      dueDate: post.dueDate ? format(new Date(post.dueDate), 'yyyy-MM-dd') : '',
    });
    setShowPostModal(true);
  };

  const handleSavePost = () => {
    if (!postForm.title.trim() || !currentUser) return;

    if (editingPost) {
      updatePost(editingPost.id, {
        ...postForm,
        dueDate: postForm.dueDate ? new Date(postForm.dueDate) : undefined,
      });
    } else {
      addPost({
        projectId: project.id,
        title: postForm.title,
        content: postForm.content,
        status: postForm.status,
        priority: postForm.priority,
        assignees: postForm.assignees,
        dueDate: postForm.dueDate ? new Date(postForm.dueDate) : undefined,
        createdBy: currentUser.id,
      });
    }

    setShowPostModal(false);
    setEditingPost(null);
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('이 게시글을 삭제하시겠습니까?')) {
      deletePost(postId);
    }
  };

  const handleTitleSave = () => {
    if (projectTitle.trim()) {
      updateProject(project.id, { name: projectTitle.trim() });
    }
    setEditingTitle(false);
  };

  const toggleAssignee = (userId: string) => {
    setPostForm((prev) => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter((id) => id !== userId)
        : [...prev.assignees, userId],
    }));
  };

  const getPostsByStatus = (status: Post['status']) =>
    projectPosts.filter((p) => p.status === status);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: project.color }}
          />
          {editingTitle ? (
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') setEditingTitle(false);
              }}
              className="text-2xl font-bold bg-transparent border-b-2 border-primary-500 focus:outline-none"
              autoFocus
            />
          ) : (
            <h1
              className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-primary-600"
              onClick={() => {
                setProjectTitle(project.name);
                setEditingTitle(true);
              }}
            >
              {project.name}
            </h1>
          )}
        </div>
        <p className="text-gray-600 mt-2">{project.description || '프로젝트 설명이 없습니다.'}</p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['todo', 'in-progress', 'done'] as const).map((status) => (
          <div key={status} className="bg-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}
                >
                  {statusLabels[status]}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  {getPostsByStatus(status).length}
                </span>
              </div>
              {status === 'todo' && (
                <button
                  onClick={handleAddPost}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Plus className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {getPostsByStatus(status).map((post) => {
                const assignedUsers = users.filter((u) =>
                  post.assignees.includes(u.id)
                );
                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => handleEditPost(post)}
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-gray-900">{post.title}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost(post.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    {post.content && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {post.content}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <Flag className={`w-4 h-4 ${priorityColors[post.priority]}`} />
                        {post.dueDate && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(post.dueDate), 'M/d', { locale: ko })}
                          </span>
                        )}
                      </div>
                      {assignedUsers.length > 0 && (
                        <div className="flex -space-x-2">
                          {assignedUsers.slice(0, 3).map((user) => (
                            <div
                              key={user.id}
                              className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center border-2 border-white"
                              title={user.name}
                            >
                              {user.name.charAt(0)}
                            </div>
                          ))}
                          {assignedUsers.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-600 text-xs flex items-center justify-center border-2 border-white">
                              +{assignedUsers.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {status === 'todo' && (
                <button
                  onClick={handleAddPost}
                  className="w-full py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg flex items-center justify-center text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  게시글 추가
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingPost ? '게시글 수정' : '새 게시글'}
              </h2>
              <button
                onClick={() => setShowPostModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목
                </label>
                <input
                  type="text"
                  value={postForm.title}
                  onChange={(e) =>
                    setPostForm({ ...postForm, title: e.target.value })
                  }
                  className="input-field"
                  placeholder="게시글 제목"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  내용
                </label>
                <textarea
                  value={postForm.content}
                  onChange={(e) =>
                    setPostForm({ ...postForm, content: e.target.value })
                  }
                  className="input-field resize-none"
                  rows={4}
                  placeholder="게시글 내용"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상태
                  </label>
                  <select
                    value={postForm.status}
                    onChange={(e) =>
                      setPostForm({
                        ...postForm,
                        status: e.target.value as Post['status'],
                      })
                    }
                    className="input-field"
                  >
                    <option value="todo">대기</option>
                    <option value="in-progress">진행 중</option>
                    <option value="done">완료</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    우선순위
                  </label>
                  <select
                    value={postForm.priority}
                    onChange={(e) =>
                      setPostForm({
                        ...postForm,
                        priority: e.target.value as Post['priority'],
                      })
                    }
                    className="input-field"
                  >
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  마감일
                </label>
                <input
                  type="date"
                  value={postForm.dueDate}
                  onChange={(e) =>
                    setPostForm({ ...postForm, dueDate: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  담당자
                </label>
                <div className="flex flex-wrap gap-2">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => toggleAssignee(user.id)}
                      className={`flex items-center px-3 py-1.5 rounded-full text-sm transition-colors ${
                        postForm.assignees.includes(user.id)
                          ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      {postForm.assignees.includes(user.id) && (
                        <Check className="w-4 h-4 mr-1" />
                      )}
                      {user.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowPostModal(false)}
                className="btn-secondary"
              >
                취소
              </button>
              <button onClick={handleSavePost} className="btn-primary">
                {editingPost ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
