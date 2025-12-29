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
  LayoutGrid,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flag,
  Clock,
} from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import { useAuthStore } from '../stores/authStore';
import { useCalendarStore } from '../stores/calendarStore';

type ViewMode = 'table' | 'calendar';

export default function MyWorkPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentDate, setCurrentDate] = useState(new Date());
  const { posts, projects } = useProjectStore();
  const { currentUser } = useAuthStore();
  const { events } = useCalendarStore();

  const myTasks = posts.filter((p) => p.assignees.includes(currentUser?.id || ''));
  const myEvents = events.filter((e) => e.userId === currentUser?.id);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: ko });
  const endDate = endOfWeek(monthEnd, { locale: ko });

  const generateCalendarDays = () => {
    const days = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  };

  const getTasksForDate = (date: Date) => {
    return myTasks.filter((task) => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), date);
    });
  };

  const getEventsForDate = (date: Date) => {
    return myEvents.filter((event) => {
      const eventStart = new Date(event.startDate);
      return isSameDay(eventStart, date);
    });
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };

  const statusColors = {
    todo: 'bg-gray-100 text-gray-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    done: 'bg-green-100 text-green-700',
  };

  const statusLabels = {
    todo: '대기',
    'in-progress': '진행 중',
    done: '완료',
  };

  const priorityLabels = {
    low: '낮음',
    medium: '보통',
    high: '높음',
  };

  const getProjectById = (projectId: string) => projects.find((p) => p.id === projectId);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">내 작업</h1>
          <p className="text-gray-600 mt-1">
            {myTasks.filter((t) => t.status !== 'done').length}개의 진행 중인 작업
          </p>
        </div>
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            테이블
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            캘린더
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Table View */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    프로젝트
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    우선순위
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    마감일
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {myTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      할당된 작업이 없습니다
                    </td>
                  </tr>
                ) : (
                  myTasks.map((task) => {
                    const project = getProjectById(task.projectId);
                    return (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div
                              className="w-2 h-2 rounded-full mr-3"
                              style={{ backgroundColor: project?.color || '#ccc' }}
                            />
                            <span className="font-medium text-gray-900">{task.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {project?.name || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              statusColors[task.status]
                            }`}
                          >
                            {statusLabels[task.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              priorityColors[task.priority]
                            }`}
                          >
                            <Flag className="w-3 h-3 mr-1" />
                            {priorityLabels[task.priority]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {task.dueDate ? (
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {format(new Date(task.dueDate), 'M월 d일', { locale: ko })}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Calendar View */
        <div>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {format(currentDate, 'yyyy년 M월', { locale: ko })}
              </h2>
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
                const dayTasks = getTasksForDate(day);
                const dayEvents = getEventsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);

                return (
                  <div
                    key={idx}
                    className={`min-h-[100px] border-b border-r border-gray-100 p-2 ${
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
                      {dayTasks.slice(0, 2).map((task) => {
                        const project = getProjectById(task.projectId);
                        return (
                          <div
                            key={task.id}
                            className="text-xs px-2 py-1 rounded truncate text-white"
                            style={{ backgroundColor: project?.color || '#0073ea' }}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        );
                      })}
                      {dayEvents.slice(0, 2 - dayTasks.length).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs px-2 py-1 rounded truncate text-white"
                          style={{ backgroundColor: event.color }}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayTasks.length + dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 px-2">
                          +{dayTasks.length + dayEvents.length - 2}개 더보기
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
