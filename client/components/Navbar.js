import Link from 'next/link';
export default function Navbar({ toggleTheme, user }) {
  return (
    <nav className="p-4 bg-gray-100 dark:bg-gray-800 flex justify-between">
      <Link href="/" className="font-bold">Emerald AI</Link>
      <div>
        <button onClick={toggleTheme} className="mr-4">Toggle</button>
        {user ? 
          <span>{user.email}</span> :
          <>
            <Link href="/login" className="mr-2">Login</Link>
            <Link href="/register">Register</Link>
          </>
        }
      </div>
    </nav>
  );
}
