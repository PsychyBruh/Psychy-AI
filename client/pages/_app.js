import '../styles/globals.css';
import { useEffect, useState } from 'react';
export default function App({ Component, pageProps }) {
  const [theme, setTheme] = useState('light');
  useEffect(()=>{
    const t = localStorage.theme||'light';
    setTheme(t); document.documentElement.classList.toggle('dark', t==='dark');
  },[]);
  const toggle = () => {
    const t = theme==='light'?'dark':'light';
    setTheme(t); localStorage.theme=t;
    document.documentElement.classList.toggle('dark', t==='dark');
  };
  return <Component {...pageProps} toggleTheme={toggle} />;
}
