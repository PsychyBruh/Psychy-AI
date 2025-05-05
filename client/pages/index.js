import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ChatWindow from '../components/ChatWindow'; // No need to import MessageInput here
import { useRouter } from 'next/router';

export default function Home({ toggleTheme }) {
  const [token, setToken] = useState(null);
  const [guest, setGuest] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('emerald_token');
      if (t) {
        setToken(t);
        setGuest(false); // Not a guest if token is present
      }
    }
  }, []);

  useEffect(() => {
    if (!token && !guest) {
      router.push('/login');
    }
  }, [token, guest, router]);

  // Pass the user token to Navbar (or use null if guest)
  const user = token ? { token } : null; // Replace with actual user data if available

  return (
    <>
      <Navbar toggleTheme={toggleTheme} user={user} />
      <ChatWindow token={token} isGuest={guest} />
    </>
  );
}
