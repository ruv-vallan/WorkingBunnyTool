import { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Users,
  ChevronLeft,
  Search,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { useMessengerStore } from '../../stores/messengerStore';
import { useAuthStore } from '../../stores/authStore';
import { format, isToday, isYesterday } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function Messenger() {
  const {
    chats,
    activeChatId,
    closeMessenger,
    setActiveChat,
    sendMessage,
    getMessagesByChat,
    getChatById,
    createChat,
    markAsRead,
  } = useMessengerStore();
  const { users, currentUser } = useAuthStore();

  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = activeChatId ? getChatById(activeChatId) : null;
  const messages = activeChatId ? getMessagesByChat(activeChatId) : [];

  const userChats = chats.filter((c) =>
    c.participants.includes(currentUser?.id || '')
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeChatId && currentUser) {
      markAsRead(activeChatId, currentUser.id);
    }
  }, [activeChatId, currentUser, markAsRead]);

  const getChatName = (chat: typeof activeChat) => {
    if (!chat || !currentUser) return '';
    if (chat.name) return chat.name;
    if (chat.type === 'direct') {
      const otherUserId = chat.participants.find((p) => p !== currentUser.id);
      const otherUser = users.find((u) => u.id === otherUserId);
      return otherUser?.name || '알 수 없음';
    }
    return '그룹 채팅';
  };

  const getChatAvatar = (chat: typeof activeChat) => {
    if (!chat || !currentUser) return '';
    if (chat.type === 'direct') {
      const otherUserId = chat.participants.find((p) => p !== currentUser.id);
      const otherUser = users.find((u) => u.id === otherUserId);
      return otherUser?.name.charAt(0) || '?';
    }
    return chat.participants.length.toString();
  };

  const handleSendMessage = () => {
    if (!message.trim() || !activeChatId || !currentUser) return;

    sendMessage({
      chatId: activeChatId,
      senderId: currentUser.id,
      content: message.trim(),
    });
    setMessage('');
  };

  const handleStartNewChat = (userId: string) => {
    if (!currentUser) return;
    const chat = createChat({
      type: 'direct',
      participants: [currentUser.id, userId],
    });
    setActiveChat(chat.id);
    setShowNewChat(false);
  };

  const formatMessageTime = (date: Date) => {
    const d = new Date(date);
    if (isToday(d)) {
      return format(d, 'a h:mm', { locale: ko });
    }
    if (isYesterday(d)) {
      return `어제 ${format(d, 'a h:mm', { locale: ko })}`;
    }
    return format(d, 'M/d a h:mm', { locale: ko });
  };

  const filteredUsers = users.filter(
    (u) =>
      u.id !== currentUser?.id &&
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed right-4 bottom-4 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        {activeChat ? (
          <>
            <button
              onClick={() => setActiveChat(null)}
              className="p-1 hover:bg-gray-100 rounded mr-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center flex-1">
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
                {getChatAvatar(activeChat)}
              </div>
              <span className="ml-2 font-medium">{getChatName(activeChat)}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 text-primary-500 mr-2" />
              <h2 className="font-semibold">메신저</h2>
            </div>
            <button
              onClick={() => setShowNewChat(true)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Plus className="w-5 h-5" />
            </button>
          </>
        )}
        <button
          onClick={closeMessenger}
          className="p-1 hover:bg-gray-100 rounded ml-2"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      {activeChat ? (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>메시지가 없습니다</p>
                <p className="text-sm">대화를 시작해보세요!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.senderId === currentUser?.id;
                const sender = users.find((u) => u.id === msg.senderId);
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        isOwn ? 'order-2' : 'order-1'
                      }`}
                    >
                      {!isOwn && (
                        <p className="text-xs text-gray-500 mb-1">
                          {sender?.name}
                        </p>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-primary-500 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      </div>
                      <p
                        className={`text-xs text-gray-400 mt-1 ${
                          isOwn ? 'text-right' : 'text-left'
                        }`}
                      >
                        {formatMessageTime(new Date(msg.timestamp))}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="메시지를 입력하세요..."
                className="flex-1 input-field"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="btn-primary p-2 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      ) : showNewChat ? (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="팀원 검색..."
                className="input-field pl-9"
              />
            </div>
            <p className="text-sm text-gray-500 mb-2">새 대화 시작</p>
            <div className="space-y-1">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleStartNewChat(user.id)}
                  className="flex items-center w-full p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-medium">
                    {user.name.charAt(0)}
                  </div>
                  <div className="ml-3 text-left">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {userChats.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>대화가 없습니다</p>
              <button
                onClick={() => setShowNewChat(true)}
                className="text-primary-500 text-sm mt-2 hover:underline"
              >
                새 대화 시작하기
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {userChats.map((chat) => {
                const chatMessages = getMessagesByChat(chat.id);
                const lastMessage = chatMessages[chatMessages.length - 1];
                const unreadCount = chatMessages.filter(
                  (m) => !m.read && m.senderId !== currentUser?.id
                ).length;

                return (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChat(chat.id)}
                    className="flex items-center w-full p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-medium">
                      {getChatAvatar(chat)}
                    </div>
                    <div className="ml-3 flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">
                          {getChatName(chat)}
                        </p>
                        {lastMessage && (
                          <span className="text-xs text-gray-400">
                            {formatMessageTime(new Date(lastMessage.timestamp))}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 truncate">
                          {lastMessage?.content || '대화를 시작하세요'}
                        </p>
                        {unreadCount > 0 && (
                          <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
