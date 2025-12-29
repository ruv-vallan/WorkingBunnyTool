import { useState } from 'react';
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Edit2,
  X,
  Calendar,
  Flag,
  User,
  GripVertical,
} from 'lucide-react';
import { BoardColumn, BoardItem } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface KanbanBoardProps {
  postId: string;
  columns: BoardColumn[];
  items: BoardItem[];
  onColumnsChange: (columns: BoardColumn[]) => void;
  onItemsChange: (items: BoardItem[]) => void;
  readOnly?: boolean;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const DEFAULT_COLUMNS: Omit<BoardColumn, 'id' | 'postId'>[] = [
  { title: '대기', order: 0 },
  { title: '진행 중', order: 1 },
  { title: '완료', order: 2 },
];

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const priorityLabels = {
  low: '낮음',
  medium: '보통',
  high: '높음',
};

export default function KanbanBoard({
  postId,
  columns,
  items,
  onColumnsChange,
  onItemsChange,
  readOnly = false,
}: KanbanBoardProps) {
  const { users } = useAuthStore();
  const [draggedItem, setDraggedItem] = useState<BoardItem | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BoardItem | null>(null);
  const [columnMenuOpen, setColumnMenuOpen] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({
    title: '',
    description: '',
    assignees: [] as string[],
    priority: 'medium' as BoardItem['priority'],
    dueDate: '',
  });

  // Initialize default columns if empty
  useState(() => {
    if (columns.length === 0) {
      const defaultCols = DEFAULT_COLUMNS.map((col, index) => ({
        ...col,
        id: generateId(),
        postId,
        order: index,
      }));
      onColumnsChange(defaultCols);
    }
  });

  const getColumnItems = (columnId: string) => {
    return items.filter((item) => item.columnId === columnId).sort((a, b) => a.order - b.order);
  };

  const handleDragStart = (e: React.DragEvent, item: BoardItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem.columnId !== columnId) {
      const updatedItems = items.map((item) =>
        item.id === draggedItem.id
          ? { ...item, columnId, order: getColumnItems(columnId).length }
          : item
      );
      onItemsChange(updatedItems);
    }
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  const addColumn = () => {
    if (!newColumnTitle.trim()) return;
    const newColumn: BoardColumn = {
      id: generateId(),
      postId,
      title: newColumnTitle.trim(),
      order: columns.length,
    };
    onColumnsChange([...columns, newColumn]);
    setNewColumnTitle('');
    setShowAddColumn(false);
  };

  const updateColumnTitle = (columnId: string, title: string) => {
    onColumnsChange(columns.map((col) => (col.id === columnId ? { ...col, title } : col)));
    setEditingColumn(null);
  };

  const deleteColumn = (columnId: string) => {
    if (window.confirm('이 컬럼을 삭제하시겠습니까? 포함된 모든 작업도 삭제됩니다.')) {
      onColumnsChange(columns.filter((col) => col.id !== columnId));
      onItemsChange(items.filter((item) => item.columnId !== columnId));
    }
  };

  const openAddItemModal = () => {
    setEditingItem(null);
    setItemForm({
      title: '',
      description: '',
      assignees: [],
      priority: 'medium',
      dueDate: '',
    });
    setShowItemModal(true);
  };

  const openEditItemModal = (item: BoardItem) => {
    setEditingItem(item);
    setItemForm({
      title: item.title,
      description: item.description,
      assignees: item.assignees,
      priority: item.priority,
      dueDate: item.dueDate ? format(new Date(item.dueDate), 'yyyy-MM-dd') : '',
    });
    setShowItemModal(true);
  };

  const saveItem = (columnId: string) => {
    if (!itemForm.title.trim()) return;

    if (editingItem) {
      const updatedItems = items.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              title: itemForm.title,
              description: itemForm.description,
              assignees: itemForm.assignees,
              priority: itemForm.priority,
              dueDate: itemForm.dueDate ? new Date(itemForm.dueDate) : undefined,
            }
          : item
      );
      onItemsChange(updatedItems);
    } else {
      const newItem: BoardItem = {
        id: generateId(),
        columnId,
        title: itemForm.title,
        description: itemForm.description,
        assignees: itemForm.assignees,
        priority: itemForm.priority,
        dueDate: itemForm.dueDate ? new Date(itemForm.dueDate) : undefined,
        status: columns.find((c) => c.id === columnId)?.title || '',
        order: getColumnItems(columnId).length,
      };
      onItemsChange([...items, newItem]);
    }
    setShowItemModal(false);
    setEditingItem(null);
  };

  const deleteItem = (itemId: string) => {
    if (window.confirm('이 작업을 삭제하시겠습니까?')) {
      onItemsChange(items.filter((item) => item.id !== itemId));
    }
  };

  const toggleAssignee = (userId: string) => {
    if (itemForm.assignees.includes(userId)) {
      setItemForm({ ...itemForm, assignees: itemForm.assignees.filter((id) => id !== userId) });
    } else {
      setItemForm({ ...itemForm, assignees: [...itemForm.assignees, userId] });
    }
  };

  const getUser = (userId: string) => users.find((u) => u.id === userId);

  return (
    <div className="h-full">
      <div className="flex space-x-4 overflow-x-auto pb-4 h-full">
        {columns.sort((a, b) => a.order - b.order).map((column) => (
          <div
            key={column.id}
            className={`flex-shrink-0 w-72 bg-gray-100 rounded-lg flex flex-col max-h-full ${
              dragOverColumn === column.id ? 'ring-2 ring-primary-500' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDrop={(e) => handleDrop(e, column.id)}
            onDragLeave={() => setDragOverColumn(null)}
          >
            {/* Column Header */}
            <div className="p-3 flex items-center justify-between">
              {editingColumn === column.id ? (
                <input
                  type="text"
                  defaultValue={column.title}
                  className="flex-1 px-2 py-1 bg-white border border-gray-300 rounded text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
                  onBlur={(e) => updateColumnTitle(column.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateColumnTitle(column.id, (e.target as HTMLInputElement).value);
                    }
                    if (e.key === 'Escape') {
                      setEditingColumn(null);
                    }
                  }}
                  autoFocus
                />
              ) : (
                <h3 className="font-semibold text-gray-700 flex items-center">
                  {column.title}
                  <span className="ml-2 text-xs text-gray-400 font-normal">
                    {getColumnItems(column.id).length}
                  </span>
                </h3>
              )}
              {!readOnly && (
                <div className="relative">
                  <button
                    onClick={() => setColumnMenuOpen(columnMenuOpen === column.id ? null : column.id)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>
                  {columnMenuOpen === column.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setColumnMenuOpen(null)} />
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[120px]">
                        <button
                          onClick={() => {
                            setEditingColumn(column.id);
                            setColumnMenuOpen(null);
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          이름 변경
                        </button>
                        <button
                          onClick={() => {
                            deleteColumn(column.id);
                            setColumnMenuOpen(null);
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          삭제
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Column Items */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
              {getColumnItems(column.id).map((item) => (
                <div
                  key={item.id}
                  draggable={!readOnly}
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow ${
                    draggedItem?.id === item.id ? 'opacity-50' : ''
                  }`}
                  onClick={() => !readOnly && openEditItemModal(item)}
                >
                  {!readOnly && (
                    <div className="flex justify-end mb-1">
                      <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                    </div>
                  )}
                  <h4 className="font-medium text-gray-900 text-sm mb-2">{item.title}</h4>
                  {item.description && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {/* Priority */}
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${priorityColors[item.priority]}`}
                    >
                      {priorityLabels[item.priority]}
                    </span>
                    {/* Due Date */}
                    {item.dueDate && (
                      <span className="text-xs text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(item.dueDate), 'M/d', { locale: ko })}
                      </span>
                    )}
                  </div>
                  {/* Assignees */}
                  {item.assignees.length > 0 && (
                    <div className="flex -space-x-2 mt-2">
                      {item.assignees.slice(0, 3).map((userId) => {
                        const user = getUser(userId);
                        return user ? (
                          <div
                            key={userId}
                            className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center border-2 border-white"
                            title={user.name}
                          >
                            {user.name.charAt(0)}
                          </div>
                        ) : null;
                      })}
                      {item.assignees.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-600 text-xs flex items-center justify-center border-2 border-white">
                          +{item.assignees.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Item Button */}
            {!readOnly && (
              <div className="p-3 pt-0">
                <button
                  onClick={() => openAddItemModal()}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  작업 추가
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add Column */}
        {!readOnly && (
          <div className="flex-shrink-0 w-72">
            {showAddColumn ? (
              <div className="bg-gray-100 rounded-lg p-3">
                <input
                  type="text"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="컬럼 이름"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addColumn();
                    if (e.key === 'Escape') setShowAddColumn(false);
                  }}
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={addColumn}
                    className="flex-1 btn-primary py-1.5 text-sm"
                  >
                    추가
                  </button>
                  <button
                    onClick={() => setShowAddColumn(false)}
                    className="btn-secondary py-1.5 text-sm"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddColumn(true)}
                className="w-full py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
              >
                <Plus className="w-5 h-5 mr-1" />
                컬럼 추가
              </button>
            )}
          </div>
        )}
      </div>

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingItem ? '작업 편집' : '새 작업'}
              </h2>
              <button
                onClick={() => {
                  setShowItemModal(false);
                  setEditingItem(null);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={itemForm.title}
                  onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                  className="input-field"
                  placeholder="작업 제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="작업에 대한 설명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Flag className="w-4 h-4 inline mr-1" />
                  우선순위
                </label>
                <div className="flex space-x-2">
                  {(['low', 'medium', 'high'] as const).map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setItemForm({ ...itemForm, priority })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        itemForm.priority === priority
                          ? priorityColors[priority]
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {priorityLabels[priority]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  마감일
                </label>
                <input
                  type="date"
                  value={itemForm.dueDate}
                  onChange={(e) => setItemForm({ ...itemForm, dueDate: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  담당자
                </label>
                <div className="flex flex-wrap gap-2">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => toggleAssignee(user.id)}
                      className={`flex items-center px-3 py-1.5 rounded-full text-sm transition-colors ${
                        itemForm.assignees.includes(user.id)
                          ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center mr-2">
                        {user.name.charAt(0)}
                      </div>
                      {user.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
              {editingItem && (
                <button
                  onClick={() => {
                    deleteItem(editingItem.id);
                    setShowItemModal(false);
                    setEditingItem(null);
                  }}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  삭제
                </button>
              )}
              <div className="flex space-x-2 ml-auto">
                <button
                  onClick={() => {
                    setShowItemModal(false);
                    setEditingItem(null);
                  }}
                  className="btn-secondary"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    const targetColumnId = editingItem?.columnId || columns[0]?.id;
                    if (targetColumnId) {
                      saveItem(targetColumnId);
                    }
                  }}
                  className="btn-primary"
                  disabled={!itemForm.title.trim()}
                >
                  {editingItem ? '저장' : '추가'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
