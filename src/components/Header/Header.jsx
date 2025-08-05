import { useState, useEffect } from 'react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full z-50 transition-all duration-400 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">

        <div className="flex items-center">
          <a href="/" className="flex items-center">

            <div className="mr-3">
              <img 
                src="/Logo.png" 
                alt="BeOnBeat Logo"
                width={60}
                height={60}
                className={`transition-all duration-400 ${isScrolled ? 'opacity-100' : 'opacity-90'}`}
              />
            </div>
            <span className={`text-2xl font-bold ${isScrolled ? 'text-gray-900' : 'text-gray-900'}`}>
              @AlexDRivera
            </span>
          </a>
        </div>


        <nav className={`${isScrolled ? 'flex' : 'hidden'} items-center space-x-8`}>
          <a href="/" className={`font-medium transition-colors ${isScrolled ? 'text-gray-800 hover:text-gray-600' : 'text-white hover:text-gray-200'}`}>
            Home
          </a>
          <a href="/about" className={`font-medium transition-colors ${isScrolled ? 'text-gray-800 hover:text-gray-600' : 'text-white hover:text-gray-200'}`}>
            About
          </a>
          <a href="/music" className={`font-medium transition-colors ${isScrolled ? 'text-gray-800 hover:text-gray-600' : 'text-white hover:text-gray-200'}`}>
            Music
          </a>
          <a href="/contact" className={`font-medium transition-colors ${isScrolled ? 'text-gray-800 hover:text-gray-600' : 'text-white hover:text-gray-200'}`}>
            Contact
          </a>
        </nav>


        <button className="md:hidden text-white focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;