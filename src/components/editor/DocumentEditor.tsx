import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  Type,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  CheckSquare,
  Table,
  Image,
  Minus,
  LayoutGrid,
  AtSign,
  X,
  ChevronDown,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { DocumentBlock, DocumentBlockType, ChecklistItem, TableCell } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { useProjectStore } from '../../stores/projectStore';

interface DocumentEditorProps {
  blocks: DocumentBlock[];
  onChange: (blocks: DocumentBlock[]) => void;
  readOnly?: boolean;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const blockTypeLabels: Record<DocumentBlockType, string> = {
  paragraph: '일반 텍스트',
  heading1: '큰 제목',
  heading2: '중간 제목',
  heading3: '소제목',
  bulletList: '글머리 기호 목록',
  checklist: '체크리스트',
  table: '테이블',
  image: '이미지',
  divider: '페이지 나누기',
  boardWidget: '보드 위젯',
};

export default function DocumentEditor({ blocks, onChange, readOnly = false }: DocumentEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addMenuPosition, setAddMenuPosition] = useState<number | null>(null);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionBlockId, setMentionBlockId] = useState<string | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mentionRef = useRef<HTMLDivElement>(null);

  const { users } = useAuthStore();
  const { posts, projects } = useProjectStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
      }
      if (mentionRef.current && !mentionRef.current.contains(e.target as Node)) {
        setShowMentionMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const createBlock = (type: DocumentBlockType): DocumentBlock => {
    const newBlock: DocumentBlock = {
      id: generateId(),
      type,
      content: '',
      alignment: 'left',
    };

    if (type === 'checklist') {
      newBlock.checklistItems = [{ id: generateId(), text: '', checked: false }];
    } else if (type === 'table') {
      newBlock.tableData = [
        [{ id: generateId(), content: '' }, { id: generateId(), content: '' }, { id: generateId(), content: '' }],
        [{ id: generateId(), content: '' }, { id: generateId(), content: '' }, { id: generateId(), content: '' }],
      ];
    }

    return newBlock;
  };

  const addBlock = (type: DocumentBlockType, index: number) => {
    const newBlock = createBlock(type);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    onChange(newBlocks);
    setShowAddMenu(false);
    setAddMenuPosition(null);
  };

  const updateBlock = (id: string, updates: Partial<DocumentBlock>) => {
    onChange(blocks.map(block => block.id === id ? { ...block, ...updates } : block));
  };

  const deleteBlock = (id: string) => {
    if (blocks.length === 1) {
      onChange([createBlock('paragraph')]);
    } else {
      onChange(blocks.filter(block => block.id !== id));
    }
  };

  const handleContentChange = (id: string, content: string) => {
    // Check for @ mention
    const lastAtIndex = content.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const afterAt = content.slice(lastAtIndex + 1);
      if (!afterAt.includes(' ')) {
        setMentionSearch(afterAt);
        setMentionBlockId(id);
        setShowMentionMenu(true);
      } else {
        setShowMentionMenu(false);
      }
    } else {
      setShowMentionMenu(false);
    }
    updateBlock(id, { content });
  };

  const insertMention = (blockId: string, mention: { id: string; type: 'user' | 'post' | 'project'; name: string }) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const lastAtIndex = block.content.lastIndexOf('@');
    const newContent = block.content.slice(0, lastAtIndex) + `@${mention.name} `;
    const newMentions = [...(block.mentions || []), mention];
    updateBlock(blockId, { content: newContent, mentions: newMentions });
    setShowMentionMenu(false);
    setMentionSearch('');
  };

  const filteredMentions = useCallback(() => {
    const search = mentionSearch.toLowerCase();
    const userMentions = users
      .filter(u => u.name.toLowerCase().includes(search))
      .map(u => ({ id: u.id, type: 'user' as const, name: u.name }));
    const postMentions = posts
      .filter(p => p.title.toLowerCase().includes(search))
      .map(p => ({ id: p.id, type: 'post' as const, name: p.title }));
    const projectMentions = projects
      .filter(p => p.name.toLowerCase().includes(search))
      .map(p => ({ id: p.id, type: 'project' as const, name: p.name }));
    return [...userMentions, ...postMentions, ...projectMentions].slice(0, 10);
  }, [mentionSearch, users, posts, projects]);

  const handleKeyDown = (e: React.KeyboardEvent, _blockId: string, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addBlock('paragraph', index);
    }
  };

  const updateChecklistItem = (blockId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.checklistItems) return;

    const newItems = block.checklistItems.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    updateBlock(blockId, { checklistItems: newItems });
  };

  const addChecklistItem = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.checklistItems) return;

    const newItems = [...block.checklistItems, { id: generateId(), text: '', checked: false }];
    updateBlock(blockId, { checklistItems: newItems });
  };

  const deleteChecklistItem = (blockId: string, itemId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.checklistItems) return;

    if (block.checklistItems.length === 1) {
      deleteBlock(blockId);
    } else {
      const newItems = block.checklistItems.filter(item => item.id !== itemId);
      updateBlock(blockId, { checklistItems: newItems });
    }
  };

  const updateTableCell = (blockId: string, rowIndex: number, colIndex: number, content: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.tableData) return;

    const newData = block.tableData.map((row, ri) =>
      ri === rowIndex
        ? row.map((cell, ci) => ci === colIndex ? { ...cell, content } : cell)
        : row
    );
    updateBlock(blockId, { tableData: newData });
  };

  const addTableRow = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.tableData) return;

    const colCount = block.tableData[0]?.length || 3;
    const newRow: TableCell[] = Array(colCount).fill(null).map(() => ({ id: generateId(), content: '' }));
    updateBlock(blockId, { tableData: [...block.tableData, newRow] });
  };

  const addTableColumn = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.tableData) return;

    const newData = block.tableData.map(row => [...row, { id: generateId(), content: '' }]);
    updateBlock(blockId, { tableData: newData });
  };

  const renderBlock = (block: DocumentBlock, index: number) => {
    const alignmentClass = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    }[block.alignment];

    const isActive = activeBlockId === block.id;

    const commonProps = {
      onFocus: () => setActiveBlockId(block.id),
      onBlur: () => setTimeout(() => setActiveBlockId(null), 200),
    };

    return (
      <div
        key={block.id}
        className={`group relative py-1 ${readOnly ? '' : 'hover:bg-gray-50'}`}
      >
        {/* Block Controls */}
        {!readOnly && (
          <div className="absolute -left-16 top-1 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => {
                setAddMenuPosition(index);
                setShowAddMenu(true);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title="블록 추가"
            >
              <Plus className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded cursor-grab" title="이동">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        )}

        {/* Delete Button */}
        {!readOnly && isActive && (
          <button
            onClick={() => deleteBlock(block.id)}
            className="absolute -right-8 top-1 p-1 hover:bg-red-100 rounded text-red-500"
            title="삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Block Content */}
        {block.type === 'paragraph' && (
          <div className={`${alignmentClass}`}>
            <textarea
              value={block.content}
              onChange={(e) => handleContentChange(block.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, block.id, index)}
              placeholder="내용을 입력하세요..."
              className="w-full resize-none bg-transparent focus:outline-none text-gray-800 min-h-[24px]"
              rows={1}
              disabled={readOnly}
              {...commonProps}
            />
          </div>
        )}

        {block.type === 'heading1' && (
          <div className={`${alignmentClass}`}>
            <input
              type="text"
              value={block.content}
              onChange={(e) => handleContentChange(block.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, block.id, index)}
              placeholder="큰 제목"
              className="w-full bg-transparent focus:outline-none text-3xl font-bold text-gray-900"
              disabled={readOnly}
              {...commonProps}
            />
          </div>
        )}

        {block.type === 'heading2' && (
          <div className={`${alignmentClass}`}>
            <input
              type="text"
              value={block.content}
              onChange={(e) => handleContentChange(block.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, block.id, index)}
              placeholder="중간 제목"
              className="w-full bg-transparent focus:outline-none text-2xl font-semibold text-gray-900"
              disabled={readOnly}
              {...commonProps}
            />
          </div>
        )}

        {block.type === 'heading3' && (
          <div className={`${alignmentClass}`}>
            <input
              type="text"
              value={block.content}
              onChange={(e) => handleContentChange(block.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, block.id, index)}
              placeholder="소제목"
              className="w-full bg-transparent focus:outline-none text-xl font-medium text-gray-900"
              disabled={readOnly}
              {...commonProps}
            />
          </div>
        )}

        {block.type === 'bulletList' && (
          <div className={`${alignmentClass} flex items-start`}>
            <span className="mr-2 text-gray-500">•</span>
            <input
              type="text"
              value={block.content}
              onChange={(e) => handleContentChange(block.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, block.id, index)}
              placeholder="목록 항목"
              className="w-full bg-transparent focus:outline-none text-gray-800"
              disabled={readOnly}
              {...commonProps}
            />
          </div>
        )}

        {block.type === 'checklist' && block.checklistItems && (
          <div className="space-y-1">
            {block.checklistItems.map((item) => (
              <div key={item.id} className="flex items-center group/item">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => updateChecklistItem(block.id, item.id, { checked: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                  disabled={readOnly}
                />
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => updateChecklistItem(block.id, item.id, { text: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addChecklistItem(block.id);
                    } else if (e.key === 'Backspace' && item.text === '') {
                      e.preventDefault();
                      deleteChecklistItem(block.id, item.id);
                    }
                  }}
                  placeholder="체크리스트 항목"
                  className={`flex-1 bg-transparent focus:outline-none ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}
                  disabled={readOnly}
                />
                {!readOnly && (
                  <button
                    onClick={() => deleteChecklistItem(block.id, item.id)}
                    className="p-1 opacity-0 group-hover/item:opacity-100 hover:bg-red-100 rounded text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            {!readOnly && (
              <button
                onClick={() => addChecklistItem(block.id)}
                className="text-sm text-gray-400 hover:text-gray-600 ml-6"
              >
                + 항목 추가
              </button>
            )}
          </div>
        )}

        {block.type === 'table' && block.tableData && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <tbody>
                {block.tableData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={cell.id} className="border border-gray-200 p-2">
                        <input
                          type="text"
                          value={cell.content}
                          onChange={(e) => updateTableCell(block.id, rowIndex, colIndex, e.target.value)}
                          className="w-full bg-transparent focus:outline-none"
                          placeholder={rowIndex === 0 ? '제목' : '내용'}
                          disabled={readOnly}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {!readOnly && (
              <div className="flex mt-2 space-x-2">
                <button
                  onClick={() => addTableRow(block.id)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  + 행 추가
                </button>
                <button
                  onClick={() => addTableColumn(block.id)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  + 열 추가
                </button>
              </div>
            )}
          </div>
        )}

        {block.type === 'image' && (
          <div className={`${alignmentClass}`}>
            {block.imageUrl ? (
              <img src={block.imageUrl} alt="" className="max-w-full rounded-lg" />
            ) : (
              !readOnly && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500">
                  <Image className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">이미지를 업로드하세요</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          updateBlock(block.id, { imageUrl: ev.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )
            )}
          </div>
        )}

        {block.type === 'divider' && (
          <hr className="border-t-2 border-gray-200 my-4" />
        )}

        {block.type === 'boardWidget' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center text-gray-600">
              <LayoutGrid className="w-5 h-5 mr-2" />
              <span>보드 위젯</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">보드의 데이터를 여기에 표시합니다</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Format Toolbar */}
      {!readOnly && activeBlockId && (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-2 mb-4 flex items-center space-x-1">
          <div className="relative">
            <button
              onClick={() => setShowFormatMenu(!showFormatMenu)}
              className="flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              <Type className="w-4 h-4 mr-2" />
              {blockTypeLabels[blocks.find(b => b.id === activeBlockId)?.type || 'paragraph']}
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>
            {showFormatMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px] z-20">
                {(['paragraph', 'heading1', 'heading2', 'heading3'] as DocumentBlockType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      updateBlock(activeBlockId, { type });
                      setShowFormatMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                  >
                    {type === 'heading1' && <Heading1 className="w-4 h-4 mr-2" />}
                    {type === 'heading2' && <Heading2 className="w-4 h-4 mr-2" />}
                    {type === 'heading3' && <Heading3 className="w-4 h-4 mr-2" />}
                    {type === 'paragraph' && <Type className="w-4 h-4 mr-2" />}
                    {blockTypeLabels[type]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-gray-300 mx-2" />

          {/* Alignment */}
          <button
            onClick={() => updateBlock(activeBlockId, { alignment: 'left' })}
            className={`p-1.5 rounded ${blocks.find(b => b.id === activeBlockId)?.alignment === 'left' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="왼쪽 정렬"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => updateBlock(activeBlockId, { alignment: 'center' })}
            className={`p-1.5 rounded ${blocks.find(b => b.id === activeBlockId)?.alignment === 'center' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="가운데 정렬"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => updateBlock(activeBlockId, { alignment: 'right' })}
            className={`p-1.5 rounded ${blocks.find(b => b.id === activeBlockId)?.alignment === 'right' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="오른쪽 정렬"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-gray-300 mx-2" />

          {/* Mention */}
          <button
            onClick={() => {
              const block = blocks.find(b => b.id === activeBlockId);
              if (block) {
                handleContentChange(activeBlockId, block.content + '@');
              }
            }}
            className="p-1.5 rounded hover:bg-gray-100"
            title="멘션"
          >
            <AtSign className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Document Content */}
      <div className="pl-16 pr-8">
        {blocks.length === 0 ? (
          <div className="py-4">
            <button
              onClick={() => addBlock('paragraph', -1)}
              className="text-gray-400 hover:text-gray-600"
            >
              + 클릭하여 내용을 추가하세요
            </button>
          </div>
        ) : (
          blocks.map((block, index) => renderBlock(block, index))
        )}
      </div>

      {/* Add Block Menu */}
      {showAddMenu && addMenuPosition !== null && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-2 w-72"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">+ 추가</h3>
          </div>
          <div className="p-2">
            <p className="text-xs text-gray-500 px-2 mb-2">가장 많이 사용됨</p>
            <button
              onClick={() => addBlock('paragraph', addMenuPosition)}
              className="w-full flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg"
            >
              <Type className="w-5 h-5 mr-3 text-gray-500" />
              <span>일반 텍스트</span>
            </button>
            <button
              onClick={() => addBlock('heading1', addMenuPosition)}
              className="w-full flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg"
            >
              <Heading1 className="w-5 h-5 mr-3 text-gray-500" />
              <span>큰 제목</span>
            </button>
            <button
              onClick={() => addBlock('heading2', addMenuPosition)}
              className="w-full flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg"
            >
              <Heading2 className="w-5 h-5 mr-3 text-gray-500" />
              <span>중간 제목</span>
            </button>
            <button
              onClick={() => addBlock('heading3', addMenuPosition)}
              className="w-full flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg"
            >
              <Heading3 className="w-5 h-5 mr-3 text-gray-500" />
              <span>소제목</span>
            </button>
            <button
              onClick={() => addBlock('bulletList', addMenuPosition)}
              className="w-full flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg"
            >
              <List className="w-5 h-5 mr-3 text-gray-500" />
              <span>글머리 기호 목록</span>
            </button>
            <button
              onClick={() => addBlock('checklist', addMenuPosition)}
              className="w-full flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg"
            >
              <CheckSquare className="w-5 h-5 mr-3 text-gray-500" />
              <span>체크리스트</span>
            </button>
          </div>
          <div className="border-t border-gray-100 p-2">
            <p className="text-xs text-gray-500 px-2 mb-2">나를 위한 제안</p>
            <button
              onClick={() => addBlock('boardWidget', addMenuPosition)}
              className="w-full flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg"
            >
              <LayoutGrid className="w-5 h-5 mr-3 text-blue-500" />
              <div className="text-left">
                <span className="block">위젯</span>
                <span className="text-xs text-gray-500">보드 데이터 시각화</span>
              </div>
            </button>
            <button
              onClick={() => addBlock('table', addMenuPosition)}
              className="w-full flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg"
            >
              <Table className="w-5 h-5 mr-3 text-green-500" />
              <div className="text-left">
                <span className="block">테이블</span>
                <span className="text-xs text-gray-500">테이블 삽입</span>
              </div>
            </button>
            <button
              onClick={() => addBlock('image', addMenuPosition)}
              className="w-full flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg"
            >
              <Image className="w-5 h-5 mr-3 text-purple-500" />
              <div className="text-left">
                <span className="block">이미지</span>
                <span className="text-xs text-gray-500">이미지 및 기타 파일 추가</span>
              </div>
            </button>
            <button
              onClick={() => addBlock('divider', addMenuPosition)}
              className="w-full flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg"
            >
              <Minus className="w-5 h-5 mr-3 text-orange-500" />
              <div className="text-left">
                <span className="block">페이지 나누기</span>
                <span className="text-xs text-gray-500">내보낼 페이지 나누기 추가</span>
              </div>
            </button>
          </div>
          <button
            onClick={() => setShowAddMenu(false)}
            className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mention Menu */}
      {showMentionMenu && mentionBlockId && (
        <div
          ref={mentionRef}
          className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-64 max-h-60 overflow-y-auto"
          style={{ top: '100px', left: '100px' }}
        >
          {filteredMentions().length === 0 ? (
            <p className="px-4 py-2 text-sm text-gray-500">검색 결과가 없습니다</p>
          ) : (
            filteredMentions().map((mention) => (
              <button
                key={`${mention.type}-${mention.id}`}
                onClick={() => insertMention(mentionBlockId, mention)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
              >
                <span className={`text-xs px-1.5 py-0.5 rounded mr-2 ${
                  mention.type === 'user' ? 'bg-blue-100 text-blue-700' :
                  mention.type === 'post' ? 'bg-green-100 text-green-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {mention.type === 'user' ? '팀원' : mention.type === 'post' ? '게시글' : '프로젝트'}
                </span>
                <span className="truncate">{mention.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
