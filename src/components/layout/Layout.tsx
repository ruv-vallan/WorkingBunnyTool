import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Messenger from '../messenger/Messenger';
import { useMessengerStore } from '../../stores/messengerStore';

export default function Layout() {
  const isMessengerOpen = useMessengerStore((state) => state.isMessengerOpen);

  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gradient-to-br from-dark-bg via-[#1a0a1a] to-dark-bg">
        <Outlet />
      </main>
      {isMessengerOpen && <Messenger />}
    </div>
  );
}
