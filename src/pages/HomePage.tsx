import { Calendar, CheckCircle, Clock, Users, FolderOpen, TrendingUp } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import { useCalendarStore } from '../stores/calendarStore';
import { useAuthStore } from '../stores/authStore';
import { format, isToday, isTomorrow, startOfDay, endOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function HomePage() {
  const { projects, posts } = useProjectStore();
  const { events } = useCalendarStore();
  const { currentUser, users } = useAuthStore();

  const today = new Date();
  const todayEvents = events.filter((e) => {
    const start = new Date(e.startDate);
    return start >= startOfDay(today) && start <= endOfDay(today);
  });

  const upcomingEvents = events
    .filter((e) => new Date(e.startDate) > today)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  const myTasks = posts.filter(
    (p) => p.assignees.includes(currentUser?.id || '') && p.status !== 'done'
  );

  const completedTasks = posts.filter((p) => p.status === 'done').length;
  const totalTasks = posts.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const formatEventDate = (date: Date) => {
    const d = new Date(date);
    if (isToday(d)) return '오늘';
    if (isTomorrow(d)) return '내일';
    return format(d, 'M월 d일', { locale: ko });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          안녕하세요, {currentUser?.name}님
        </h1>
        <p className="text-gray-600">
          {format(today, 'yyyy년 M월 d일 EEEE', { locale: ko })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">진행 중인 프로젝트</p>
              <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">오늘 일정</p>
              <p className="text-3xl font-bold text-gray-900">{todayEvents.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">팀원</p>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">작업 완료율</p>
              <p className="text-3xl font-bold text-gray-900">{progressPercent}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-primary-500" />
            내 작업
          </h2>
          {myTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              할당된 작업이 없습니다
            </p>
          ) : (
            <ul className="space-y-3">
              {myTasks.slice(0, 5).map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                return (
                  <li
                    key={task.id}
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full mr-3"
                      style={{ backgroundColor: project?.color || '#ccc' }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-500">{project?.name}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        task.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {task.status === 'in-progress' ? '진행 중' : '대기 중'}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary-500" />
            다가오는 일정
          </h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              예정된 일정이 없습니다
            </p>
          ) : (
            <ul className="space-y-3">
              {upcomingEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div
                    className="w-1 h-12 rounded-full mr-3"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {formatEventDate(new Date(event.startDate))}
                      {!event.allDay && (
                        <> · {format(new Date(event.startDate), 'HH:mm')}</>
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
