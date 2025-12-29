import { useState, useRef } from 'react';
import {
  Folder,
  File,
  Upload,
  FolderPlus,
  ChevronRight,
  Home,
  Download,
  Trash2,
  Edit2,
  X,
  FileText,
  Image,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';
import { useDriveStore } from '../stores/driveStore';
import { useAuthStore } from '../stores/authStore';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function DrivePage() {
  const {
    currentFolderId,
    selectedFileIds,
    uploadFile,
    createFolder,
    deleteFile,
    renameFile,
    setCurrentFolder,
    toggleFileSelection,
    getFilesInFolder,
    getFolderPath,
    getFileById,
  } = useDriveStore();
  const { currentUser, getUserById } = useAuthStore();

  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    fileId: string;
    x: number;
    y: number;
  } | null>(null);
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFiles = getFilesInFolder(currentFolderId);
  const folderPath = getFolderPath(currentFolderId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || !currentUser) return;

    Array.from(uploadedFiles).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        uploadFile({
          name: file.name,
          type: 'file',
          mimeType: file.type,
          size: file.size,
          parentId: currentFolderId,
          uploadedBy: currentUser.id,
          content: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim() && currentUser) {
      createFolder(newFolderName.trim(), currentFolderId, currentUser.id);
      setNewFolderName('');
      setShowNewFolderModal(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    setContextMenu({ fileId, x: e.clientX, y: e.clientY });
  };

  const handleRename = (fileId: string) => {
    const file = getFileById(fileId);
    if (file) {
      setRenamingFile(fileId);
      setRenameValue(file.name);
      setContextMenu(null);
    }
  };

  const handleRenameSubmit = () => {
    if (renamingFile && renameValue.trim()) {
      renameFile(renamingFile, renameValue.trim());
      setRenamingFile(null);
      setRenameValue('');
    }
  };

  const handleDownload = (fileId: string) => {
    const file = getFileById(fileId);
    if (file && file.content) {
      const link = document.createElement('a');
      link.href = file.content;
      link.download = file.name;
      link.click();
    }
    setContextMenu(null);
  };

  const handleDelete = (fileId: string) => {
    deleteFile(fileId);
    setContextMenu(null);
  };

  const getFileIcon = (file: { type: string; mimeType?: string; name: string }) => {
    if (file.type === 'folder') return <Folder className="w-10 h-10 text-blue-500" />;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (file.mimeType?.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext || '')) {
      return <Image className="w-10 h-10 text-green-500" />;
    }
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'java'].includes(ext || '')) {
      return <FileCode className="w-10 h-10 text-purple-500" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) {
      return <FileSpreadsheet className="w-10 h-10 text-green-600" />;
    }
    if (['doc', 'docx', 'txt', 'pdf'].includes(ext || '')) {
      return <FileText className="w-10 h-10 text-blue-600" />;
    }
    return <File className="w-10 h-10 text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">드라이브</h1>
          {/* Breadcrumb */}
          <div className="flex items-center mt-2 text-sm">
            <button
              onClick={() => setCurrentFolder(null)}
              className="flex items-center hover:text-primary-600"
            >
              <Home className="w-4 h-4 mr-1" />
              홈
            </button>
            {folderPath.map((folder) => (
              <div key={folder.id} className="flex items-center">
                <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                <button
                  onClick={() => setCurrentFolder(folder.id)}
                  className="hover:text-primary-600"
                >
                  {folder.name}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="btn-secondary flex items-center"
          >
            <FolderPlus className="w-5 h-5 mr-1" />
            새 폴더
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary flex items-center"
          >
            <Upload className="w-5 h-5 mr-1" />
            업로드
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Files Grid */}
      {currentFiles.length === 0 ? (
        <div className="card p-12 text-center">
          <Folder className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">이 폴더가 비어있습니다</p>
          <p className="text-sm text-gray-400 mt-1">
            파일을 업로드하거나 새 폴더를 만들어보세요
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {currentFiles.map((file) => {
            const uploader = getUserById(file.uploadedBy);
            return (
              <div
                key={file.id}
                className={`card p-4 cursor-pointer hover:shadow-md transition-shadow ${
                  selectedFileIds.includes(file.id) ? 'ring-2 ring-primary-500' : ''
                }`}
                onClick={() => {
                  if (file.type === 'folder') {
                    setCurrentFolder(file.id);
                  } else {
                    toggleFileSelection(file.id);
                  }
                }}
                onContextMenu={(e) => handleContextMenu(e, file.id)}
                onDoubleClick={() => {
                  if (file.type === 'folder') {
                    setCurrentFolder(file.id);
                  }
                }}
              >
                <div className="flex justify-center mb-3">
                  {getFileIcon(file)}
                </div>
                {renamingFile === file.id ? (
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameSubmit();
                      if (e.key === 'Escape') setRenamingFile(null);
                    }}
                    className="w-full text-sm px-1 border rounded text-center"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900 truncate text-center">
                    {file.name}
                  </p>
                )}
                <div className="mt-2 text-xs text-gray-500 text-center">
                  {file.type === 'file' && formatFileSize(file.size)}
                  {file.type === 'folder' && '폴더'}
                </div>
                <div className="mt-1 text-xs text-gray-400 text-center truncate">
                  {uploader?.name} · {format(new Date(file.uploadedAt), 'M/d', { locale: ko })}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
              onClick={() => handleRename(contextMenu.fileId)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              이름 변경
            </button>
            {getFileById(contextMenu.fileId)?.type === 'file' && (
              <button
                onClick={() => handleDownload(contextMenu.fileId)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Download className="w-4 h-4 mr-2" />
                다운로드
              </button>
            )}
            <button
              onClick={() => handleDelete(contextMenu.fileId)}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              삭제
            </button>
          </div>
        </>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">새 폴더</h2>
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
              }}
              className="input-field"
              placeholder="폴더 이름"
              autoFocus
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="btn-secondary"
              >
                취소
              </button>
              <button onClick={handleCreateFolder} className="btn-primary">
                만들기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
