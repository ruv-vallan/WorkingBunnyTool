import { useState, useRef, useCallback } from 'react';
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
  Eye,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useDriveStore } from '../stores/driveStore';
import { useAuthStore } from '../stores/authStore';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { DriveFile } from '../types';

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
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
  const [previewZoom, setPreviewZoom] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFiles = getFilesInFolder(currentFolderId);
  const folderPath = getFolderPath(currentFolderId);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files || !currentUser) return;

    Array.from(files).forEach((file) => {
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
  }, [currentFolderId, currentUser, uploadFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
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

  const handlePreview = (file: DriveFile) => {
    if (file.type === 'file' && file.content) {
      setPreviewFile(file);
      setPreviewZoom(100);
    }
    setContextMenu(null);
  };

  const canPreview = (file: DriveFile) => {
    if (!file.mimeType) return false;
    return (
      file.mimeType.startsWith('image/') ||
      file.mimeType === 'application/pdf' ||
      file.mimeType.includes('text') ||
      file.mimeType.includes('json') ||
      file.mimeType.includes('spreadsheet') ||
      file.mimeType.includes('excel') ||
      file.name.endsWith('.csv')
    );
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

  const renderPreviewContent = (file: DriveFile) => {
    if (!file.content) return null;

    if (file.mimeType?.startsWith('image/')) {
      return (
        <img
          src={file.content}
          alt={file.name}
          style={{ transform: `scale(${previewZoom / 100})` }}
          className="max-w-full max-h-full object-contain transition-transform"
        />
      );
    }

    if (file.mimeType === 'application/pdf') {
      return (
        <iframe
          src={file.content}
          className="w-full h-full"
          title={file.name}
        />
      );
    }

    if (file.mimeType?.includes('spreadsheet') || file.mimeType?.includes('excel') || file.name.endsWith('.csv')) {
      // CSV/Excel preview
      try {
        const base64Content = file.content.split(',')[1];
        const decodedContent = atob(base64Content);
        const lines = decodedContent.split('\n').slice(0, 20);

        return (
          <div className="w-full h-full overflow-auto bg-white p-4">
            <table className="w-full border-collapse text-sm">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className={i === 0 ? 'bg-gray-100 font-medium' : ''}>
                    {line.split(',').map((cell, j) => (
                      <td key={j} className="border border-gray-200 px-3 py-2">
                        {cell.replace(/"/g, '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {lines.length >= 20 && (
              <p className="text-center text-gray-500 mt-4">... 일부 데이터만 표시됩니다</p>
            )}
          </div>
        );
      } catch {
        return <p className="text-gray-500">미리보기를 불러올 수 없습니다</p>;
      }
    }

    if (file.mimeType?.includes('text') || file.mimeType?.includes('json')) {
      try {
        const base64Content = file.content.split(',')[1];
        const decodedContent = atob(base64Content);
        return (
          <pre className="w-full h-full overflow-auto bg-gray-900 text-gray-100 p-6 text-sm font-mono rounded-lg">
            {decodedContent}
          </pre>
        );
      } catch {
        return <p className="text-gray-500">미리보기를 불러올 수 없습니다</p>;
      }
    }

    return <p className="text-gray-500">이 파일 형식은 미리보기를 지원하지 않습니다</p>;
  };

  return (
    <div
      className="p-8 min-h-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 bg-primary-500/20 border-4 border-dashed border-primary-500 z-40 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-xl p-8 shadow-xl text-center">
            <Upload className="w-16 h-16 mx-auto text-primary-500 mb-4" />
            <p className="text-xl font-medium text-gray-900">파일을 여기에 놓으세요</p>
            <p className="text-gray-500 mt-1">드롭하여 업로드</p>
          </div>
        </div>
      )}

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
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Files Grid */}
      {currentFiles.length === 0 ? (
        <div
          className="card p-12 text-center border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">이 폴더가 비어있습니다</p>
          <p className="text-sm text-gray-400 mt-1">
            클릭하거나 파일을 드래그하여 업로드하세요
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
                  } else if (canPreview(file)) {
                    handlePreview(file);
                  }
                }}
              >
                <div className="flex justify-center mb-3 relative">
                  {file.type === 'file' && file.mimeType?.startsWith('image/') && file.content ? (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={file.content}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    getFileIcon(file)
                  )}
                  {canPreview(file) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(file);
                      }}
                      className="absolute top-0 right-0 p-1 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 hover:bg-gray-100"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
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
            {getFileById(contextMenu.fileId)?.type === 'file' && canPreview(getFileById(contextMenu.fileId)!) && (
              <button
                onClick={() => handlePreview(getFileById(contextMenu.fileId)!)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Eye className="w-4 h-4 mr-2" />
                미리보기
              </button>
            )}
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

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            {previewFile.mimeType?.startsWith('image/') && (
              <>
                <button
                  onClick={() => setPreviewZoom(Math.max(25, previewZoom - 25))}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-white px-2">{previewZoom}%</span>
                <button
                  onClick={() => setPreviewZoom(Math.min(200, previewZoom + 25))}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={() => handleDownload(previewFile.id)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPreviewFile(null)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute top-4 left-4">
            <h3 className="text-white font-medium">{previewFile.name}</h3>
            <p className="text-white/60 text-sm">{formatFileSize(previewFile.size)}</p>
          </div>

          <div className="w-full h-full max-w-5xl max-h-[80vh] p-16 flex items-center justify-center">
            {renderPreviewContent(previewFile)}
          </div>
        </div>
      )}
    </div>
  );
}
