import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, Chat } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface MessengerState {
  chats: Chat[];
  messages: Message[];
  activeChatId: string | null;
  isMessengerOpen: boolean;
  createChat: (chat: Omit<Chat, 'id' | 'createdAt'>) => Chat;
  deleteChat: (id: string) => void;
  sendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => Message;
  markAsRead: (chatId: string, userId: string) => void;
  setActiveChat: (chatId: string | null) => void;
  toggleMessenger: () => void;
  openMessenger: () => void;
  closeMessenger: () => void;
  getMessagesByChat: (chatId: string) => Message[];
  getChatById: (chatId: string) => Chat | undefined;
  getOrCreateDirectChat: (userId1: string, userId2: string) => Chat;
  getUnreadCount: (userId: string) => number;
}

export const useMessengerStore = create<MessengerState>()(
  persist(
    (set, get) => ({
      chats: [],
      messages: [],
      activeChatId: null,
      isMessengerOpen: false,

      createChat: (chatData) => {
        const existingChat = get().chats.find(
          (c) =>
            c.type === 'direct' &&
            c.participants.length === chatData.participants.length &&
            c.participants.every((p) => chatData.participants.includes(p))
        );
        if (existingChat) return existingChat;

        const newChat: Chat = {
          ...chatData,
          id: uuidv4(),
          createdAt: new Date(),
        };
        set((state) => ({
          chats: [...state.chats, newChat],
        }));
        return newChat;
      },

      deleteChat: (id) => {
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== id),
          messages: state.messages.filter((m) => m.chatId !== id),
          activeChatId: state.activeChatId === id ? null : state.activeChatId,
        }));
      },

      sendMessage: (messageData) => {
        const newMessage: Message = {
          ...messageData,
          id: uuidv4(),
          timestamp: new Date(),
          read: false,
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
          chats: state.chats.map((c) =>
            c.id === messageData.chatId ? { ...c, lastMessage: newMessage } : c
          ),
        }));
        return newMessage;
      },

      markAsRead: (chatId, userId) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.chatId === chatId && m.senderId !== userId
              ? { ...m, read: true }
              : m
          ),
        }));
      },

      setActiveChat: (chatId) => {
        set({ activeChatId: chatId });
      },

      toggleMessenger: () => {
        set((state) => ({ isMessengerOpen: !state.isMessengerOpen }));
      },

      openMessenger: () => {
        set({ isMessengerOpen: true });
      },

      closeMessenger: () => {
        set({ isMessengerOpen: false, activeChatId: null });
      },

      getMessagesByChat: (chatId) => {
        return get()
          .messages.filter((m) => m.chatId === chatId)
          .sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
      },

      getChatById: (chatId) => {
        return get().chats.find((c) => c.id === chatId);
      },

      getOrCreateDirectChat: (userId1, userId2) => {
        const existingChat = get().chats.find(
          (c) =>
            c.type === 'direct' &&
            c.participants.includes(userId1) &&
            c.participants.includes(userId2)
        );
        if (existingChat) return existingChat;

        return get().createChat({
          type: 'direct',
          participants: [userId1, userId2],
        });
      },

      getUnreadCount: (userId) => {
        const userChats = get().chats.filter((c) =>
          c.participants.includes(userId)
        );
        return get().messages.filter(
          (m) =>
            userChats.some((c) => c.id === m.chatId) &&
            m.senderId !== userId &&
            !m.read
        ).length;
      },
    }),
    {
      name: 'messenger-storage',
    }
  )
);
