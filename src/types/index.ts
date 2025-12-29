export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'member' | 'guest';
  phone: string;
  avatar: string;
  department: string;
  bio: string;
  createdAt: Date;
  permissions: UserPermissions;
}

export interface UserPermissions {
  canManageTeam: boolean;
  canManageProjects: boolean;
  accessibleProjects: string[]; // 'all' or specific project IDs
  accessiblePosts: string[]; // 'all' or specific post IDs
}

export interface TeamSettings {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
  createdAt: Date;
}

export type PostType = 'board' | 'document' | 'dashboard' | 'form' | 'workflow' | 'folder';

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdBy: string;
  createdAt: Date;
  order: number;
  accessibleBy: string[]; // user IDs who can access
}

export interface Post {
  id: string;
  projectId: string;
  title: string;
  content: string;
  type: PostType;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignees: string[];
  dueDate?: Date;
  createdBy: string;
  createdAt: Date;
  order: number;
  accessibleBy: string[]; // user IDs who can access
}

export interface BoardColumn {
  id: string;
  postId: string;
  title: string;
  order: number;
}

export interface BoardItem {
  id: string;
  columnId: string;
  title: string;
  description: string;
  assignees: string[];
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: string;
  order: number;
}

export type DocumentBlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'checklist'
  | 'table'
  | 'image'
  | 'divider'
  | 'boardWidget';

export type TextAlignment = 'left' | 'center' | 'right';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface TableCell {
  id: string;
  content: string;
}

export interface DocumentBlock {
  id: string;
  type: DocumentBlockType;
  content: string;
  alignment: TextAlignment;
  checklistItems?: ChecklistItem[];
  tableData?: TableCell[][];
  imageUrl?: string;
  linkedBoardId?: string;
  mentions?: { id: string; type: 'user' | 'post' | 'project'; name: string }[];
}

export interface DocumentContent {
  id: string;
  postId: string;
  blocks: DocumentBlock[];
  updatedAt: Date;
  updatedBy: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  color: string;
  userId: string;
  projectId?: string;
  postId?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  participants: string[];
  lastMessage?: Message;
  createdAt: Date;
}

export interface DriveFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size?: number;
  parentId: string | null;
  uploadedBy: string;
  uploadedAt: Date;
  content?: string;
}

export const POST_TYPE_INFO: Record<PostType, { label: string; icon: string; description: string }> = {
  board: {
    label: '보드',
    icon: 'LayoutGrid',
    description: '칸반 스타일 보드로 작업을 관리합니다',
  },
  document: {
    label: 'Document',
    icon: 'FileText',
    description: '문서를 작성하고 공유합니다',
  },
  dashboard: {
    label: '대시보드',
    icon: 'BarChart3',
    description: '데이터를 시각화하여 확인합니다',
  },
  form: {
    label: '양식',
    icon: 'ClipboardList',
    description: '팀원들이 제출할 양식을 만듭니다',
  },
  workflow: {
    label: '워크플로우',
    icon: 'GitBranch',
    description: '자동화된 작업 흐름을 설정합니다',
  },
  folder: {
    label: '폴더',
    icon: 'Folder',
    description: '게시글을 그룹으로 정리합니다',
  },
};
