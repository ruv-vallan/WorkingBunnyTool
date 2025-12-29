export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  phone: string;
  avatar: string;
  department: string;
  bio: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdBy: string;
  createdAt: Date;
  order: number;
}

export interface Post {
  id: string;
  projectId: string;
  title: string;
  content: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignees: string[];
  dueDate?: Date;
  createdBy: string;
  createdAt: Date;
  order: number;
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
