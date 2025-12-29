import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Check,
} from 'lucide-react';
import { useCalendarStore } from '../stores/calendarStore';
import { useAuthStore } from '../stores/authStore';
import { CalendarEvent } from '../types';

export default function CalendarPage() {
  const {
    currentDate,
    selectedUserIds,
    setCurrentDate,
    toggleUserFilter,
    setSelectedUsers,
    addEvent,
    updateEvent,
    deleteEvent,
    getFilteredEvents,
  } = useCalendarStore();
  const { users, currentUser } = useAuthStore();

  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '10:00',
    allDay: false,
    color: '#0073ea',
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: ko });
  const endDate = endOfWeek(monthEnd, { locale: ko });

  const filteredEvents = getFilteredEvents();

  const generateCalendarDays = () => {
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return date >= startOfWeek(eventStart) && date <= endOfWeek(eventEnd) && isSameDay(eventStart, date);
    });
  };

  const handleDateClick = (date: Date) => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      description: '',
      startDate: format(date, 'yyyy-MM-dd'),
      startTime: '09:00',
      endDate: format(date, 'yyyy-MM-dd'),
      endTime: '10:00',
      allDay: false,
      color: '#0073ea',
    });
    setShowEventModal(true);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      startDate: format(new Date(event.startDate), 'yyyy-MM-dd'),
      startTime: format(new Date(event.startDate), 'HH:mm'),
      endDate: format(new Date(event.endDate), 'yyyy-MM-dd'),
      endTime: format(new Date(event.endDate), 'HH:mm'),
      allDay: event.allDay,
      color: event.color,
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = () => {
    if (!eventForm.title.trim() || !currentUser) return;

    const startDateTime = eventForm.allDay
      ? new Date(eventForm.startDate)
      : new Date(`${eventForm.startDate}T${eventForm.startTime}`);
    const endDateTime = eventForm.allDay
      ? new Date(eventForm.endDate)
      : new Date(`${eventForm.endDate}T${eventForm.endTime}`);

    if (editingEvent) {
      updateEvent(editingEvent.id, {
        title: eventForm.title,
        description: eventForm.description,
        startDate: startDateTime,
        endDate: endDateTime,
        allDay: eventForm.allDay,
        color: eventForm.color,
      });
    } else {
      addEvent({
        title: eventForm.title,
        description: eventForm.description,
        startDate: startDateTime,
        endDate: endDateTime,
        allDay: eventForm.allDay,
        color: eventForm.color,
        userId: currentUser.id,
      });
    }

    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = () => {
    if (editingEvent) {
      deleteEvent(editingEvent.id);
      setShowEventModal(false);
      setEditingEvent(null);
    }
  };

  const colors = [
    '#0073ea',
    '#00c875',
    '#fdab3d',
    '#e2445c',
    '#a25ddc',
    '#037f4c',
    '#579bfc',
    '#ff642e',
  ];

  const getUserById = (id: string) => users.find((u) => u.id === id);

  return (
    <div className="h-full flex">
      {/* Sidebar - Team Filter */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <h2 className="font-semibold text-gray-900 mb-4">팀원 필터</h2>
        <div className="space-y-2 flex-1 overflow-y-auto">
          <button
            onClick={() => setSelectedUsers([])}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedUserIds.length === 0
                ? 'bg-primary-50 text-primary-700'
                : 'hover:bg-gray-100'
            }`}
          >
            모든 팀원
          </button>
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => toggleUserFilter(user.id)}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedUserIds.includes(user.id)
                  ? 'bg-primary-50 text-primary-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div
                className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${
                  selectedUserIds.includes(user.id)
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedUserIds.includes(user.id) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              <div className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center mr-2">
                {user.name.charAt(0)}
              </div>
              <span className="truncate">{user.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {format(currentDate, 'yyyy년 M월', { locale: ko })}
            </h1>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm hover:bg-gray-100 rounded-lg"
              >
                오늘
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <button
            onClick={() => handleDateClick(new Date())}
            className="btn-primary flex items-center"
          >
            <Plus className="w-5 h-5 mr-1" />
            일정 추가
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="card overflow-hidden">
          {/* Weekday Header */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
              <div
                key={day}
                className={`py-3 text-center text-sm font-medium ${
                  i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-700'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7">
            {generateCalendarDays().map((day, idx) => {
              const dayEvents = getEventsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <div
                  key={idx}
                  onClick={() => handleDateClick(day)}
                  className={`min-h-[120px] border-b border-r border-gray-100 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !isCurrentMonth ? 'bg-gray-50' : ''
                  }`}
                >
                  <div
                    className={`text-sm mb-1 ${
                      isToday(day)
                        ? 'w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center'
                        : !isCurrentMonth
                        ? 'text-gray-400'
                        : idx % 7 === 0
                        ? 'text-red-500'
                        : idx % 7 === 6
                        ? 'text-blue-500'
                        : 'text-gray-900'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => {
                      const eventUser = getUserById(event.userId);
                      return (
                        <div
                          key={event.id}
                          onClick={(e) => handleEventClick(event, e)}
                          className="text-xs px-2 py-1 rounded truncate text-white cursor-pointer hover:opacity-80"
                          style={{ backgroundColor: event.color }}
                          title={`${event.title} (${eventUser?.name})`}
                        >
                          {event.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 px-2">
                        +{dayEvents.length - 3}개 더보기
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingEvent ? '일정 수정' : '새 일정'}
              </h2>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, title: e.target.value })
                  }
                  className="input-field"
                  placeholder="일정 제목"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, description: e.target.value })
                  }
                  className="input-field resize-none"
                  rows={3}
                  placeholder="일정 설명"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={eventForm.allDay}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, allDay: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-500 rounded"
                />
                <label htmlFor="allDay" className="ml-2 text-sm text-gray-700">
                  종일
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={eventForm.startDate}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, startDate: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                {!eventForm.allDay && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      시작 시간
                    </label>
                    <input
                      type="time"
                      value={eventForm.startTime}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, startTime: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    종료일
                  </label>
                  <input
                    type="date"
                    value={eventForm.endDate}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, endDate: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                {!eventForm.allDay && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      종료 시간
                    </label>
                    <input
                      type="time"
                      value={eventForm.endTime}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, endTime: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  색상
                </label>
                <div className="flex space-x-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setEventForm({ ...eventForm, color })}
                      className={`w-8 h-8 rounded-full ${
                        eventForm.color === color
                          ? 'ring-2 ring-offset-2 ring-gray-400'
                          : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              {editingEvent && (
                <button
                  onClick={handleDeleteEvent}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  삭제
                </button>
              )}
              <div className="flex space-x-2 ml-auto">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="btn-secondary"
                >
                  취소
                </button>
                <button onClick={handleSaveEvent} className="btn-primary">
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
