import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Messenger from '../messenger/Messenger';
import { useMessengerStore } from '../../stores/messengerStore';

export default function Layout() {
  const isMessengerOpen = useMessengerStore((state) => state.isMessengerOpen);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      {isMessengerOpen && <Messenger />}
    </div>
  );
}
