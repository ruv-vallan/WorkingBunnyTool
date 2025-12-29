import { useEffect, useState } from 'react';
import { Post, DocumentBlock, BoardColumn, BoardItem } from '../../types';
import { useProjectStore } from '../../stores/projectStore';
import DocumentEditor from '../editor/DocumentEditor';
import KanbanBoard from '../board/KanbanBoard';
import {
  BarChart3,
  ClipboardList,
  GitBranch,
  Folder,
  FileText,
} from 'lucide-react';

interface PostViewProps {
  post: Post;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function PostView({ post }: PostViewProps) {
  const {
    getDocumentBlocks,
    updateDocumentBlocks,
    getBoardColumns,
    getBoardItems,
    updateBoardColumns,
    updateBoardItems,
  } = useProjectStore();

  const [documentBlocks, setDocumentBlocks] = useState<DocumentBlock[]>([]);
  const [boardColumns, setBoardColumns] = useState<BoardColumn[]>([]);
  const [boardItems, setBoardItems] = useState<BoardItem[]>([]);

  useEffect(() => {
    if (post.type === 'document') {
      const blocks = getDocumentBlocks(post.id);
      if (blocks.length === 0) {
        // Initialize with empty paragraph
        const initialBlock: DocumentBlock = {
          id: generateId(),
          type: 'paragraph',
          content: '',
          alignment: 'left',
        };
        setDocumentBlocks([initialBlock]);
      } else {
        setDocumentBlocks(blocks);
      }
    } else if (post.type === 'board') {
      const columns = getBoardColumns(post.id);
      const items = getBoardItems(post.id);

      if (columns.length === 0) {
        // Initialize with default columns
        const defaultColumns: BoardColumn[] = [
          { id: generateId(), postId: post.id, title: '대기', order: 0 },
          { id: generateId(), postId: post.id, title: '진행 중', order: 1 },
          { id: generateId(), postId: post.id, title: '완료', order: 2 },
        ];
        setBoardColumns(defaultColumns);
        updateBoardColumns(post.id, defaultColumns);
      } else {
        setBoardColumns(columns);
      }
      setBoardItems(items);
    }
  }, [post.id, post.type]);

  const handleDocumentChange = (blocks: DocumentBlock[]) => {
    setDocumentBlocks(blocks);
    updateDocumentBlocks(post.id, blocks);
  };

  const handleColumnsChange = (columns: BoardColumn[]) => {
    setBoardColumns(columns);
    updateBoardColumns(post.id, columns);
  };

  const handleItemsChange = (items: BoardItem[]) => {
    setBoardItems(items);
    updateBoardItems(post.id, items);
  };

  // Render based on post type
  switch (post.type) {
    case 'document':
      return (
        <div className="h-full overflow-y-auto">
          <DocumentEditor
            blocks={documentBlocks}
            onChange={handleDocumentChange}
          />
        </div>
      );

    case 'board':
      return (
        <div className="h-full">
          <KanbanBoard
            postId={post.id}
            columns={boardColumns}
            items={boardItems}
            onColumnsChange={handleColumnsChange}
            onItemsChange={handleItemsChange}
          />
        </div>
      );

    case 'dashboard':
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <BarChart3 className="w-16 h-16 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">대시보드</h3>
          <p className="text-sm">데이터를 시각화하여 확인합니다</p>
          <p className="text-xs mt-2 text-gray-400">준비 중인 기능입니다</p>
        </div>
      );

    case 'form':
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <ClipboardList className="w-16 h-16 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">양식</h3>
          <p className="text-sm">팀원들이 제출할 양식을 만듭니다</p>
          <p className="text-xs mt-2 text-gray-400">준비 중인 기능입니다</p>
        </div>
      );

    case 'workflow':
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <GitBranch className="w-16 h-16 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">워크플로우</h3>
          <p className="text-sm">자동화된 작업 흐름을 설정합니다</p>
          <p className="text-xs mt-2 text-gray-400">준비 중인 기능입니다</p>
        </div>
      );

    case 'folder':
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Folder className="w-16 h-16 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">폴더</h3>
          <p className="text-sm">게시글을 그룹으로 정리합니다</p>
          <p className="text-xs mt-2 text-gray-400">준비 중인 기능입니다</p>
        </div>
      );

    default:
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <FileText className="w-16 h-16 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">알 수 없는 형태</h3>
        </div>
      );
  }
}
