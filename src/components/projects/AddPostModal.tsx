import { useState } from 'react';
import {
  X,
  LayoutGrid,
  FileText,
  BarChart3,
  ClipboardList,
  GitBranch,
  Folder,
} from 'lucide-react';
import { PostType, POST_TYPE_INFO } from '../../types';

interface AddPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: PostType, title: string) => void;
}

const iconMap = {
  LayoutGrid,
  FileText,
  BarChart3,
  ClipboardList,
  GitBranch,
  Folder,
};

export default function AddPostModal({ isOpen, onClose, onSelect }: AddPostModalProps) {
  const [step, setStep] = useState<'select' | 'name'>('select');
  const [selectedType, setSelectedType] = useState<PostType | null>(null);
  const [title, setTitle] = useState('');

  if (!isOpen) return null;

  const handleTypeSelect = (type: PostType) => {
    setSelectedType(type);
    setStep('name');
  };

  const handleSubmit = () => {
    if (selectedType && title.trim()) {
      onSelect(selectedType, title.trim());
      setStep('select');
      setSelectedType(null);
      setTitle('');
      onClose();
    }
  };

  const handleClose = () => {
    setStep('select');
    setSelectedType(null);
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {step === 'select' ? '새 항목 추가' : '이름 입력'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'select' ? (
            <>
              <p className="text-gray-600 mb-6">
                추가할 항목의 유형을 선택하세요
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(Object.entries(POST_TYPE_INFO) as [PostType, typeof POST_TYPE_INFO[PostType]][]).map(
                  ([type, info]) => {
                    const Icon = iconMap[info.icon as keyof typeof iconMap];
                    return (
                      <button
                        key={type}
                        onClick={() => handleTypeSelect(type)}
                        className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
                      >
                        <div className="w-12 h-12 bg-gray-100 group-hover:bg-primary-100 rounded-xl flex items-center justify-center mb-3 transition-colors">
                          <Icon className="w-6 h-6 text-gray-600 group-hover:text-primary-600" />
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          {info.label}
                        </h3>
                        <p className="text-xs text-gray-500 text-center">
                          {info.description}
                        </p>
                      </button>
                    );
                  }
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center mb-6">
                {selectedType && (
                  <>
                    {(() => {
                      const info = POST_TYPE_INFO[selectedType];
                      const Icon = iconMap[info.icon as keyof typeof iconMap];
                      return (
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                          <Icon className="w-5 h-5 text-primary-600" />
                        </div>
                      );
                    })()}
                    <span className="font-medium text-gray-900">
                      {POST_TYPE_INFO[selectedType].label}
                    </span>
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit();
                  }}
                  placeholder="항목 이름을 입력하세요"
                  className="input-field"
                  autoFocus
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          {step === 'name' && (
            <button
              onClick={() => setStep('select')}
              className="btn-secondary"
            >
              뒤로
            </button>
          )}
          <div className="ml-auto flex space-x-2">
            <button onClick={handleClose} className="btn-secondary">
              취소
            </button>
            {step === 'name' && (
              <button
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="btn-primary disabled:opacity-50"
              >
                만들기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
