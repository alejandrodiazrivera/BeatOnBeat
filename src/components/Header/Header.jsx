import { useState, useEffect } from 'react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`fixed w-full z-50 transition-all duration-400 ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg border-b-2 border-transparent py-3' : 'bg-transparent py-5'}`}>
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
              <span className={`text-2xl font-bold transition-colors duration-400 ${isScrolled ? 'text-black' : 'text-black'}`}>
                @AlexDRivera
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className={`font-medium transition-colors duration-400 ${isScrolled ? 'text-[black] hover:text-[#f0807f]' : 'text-black hover:text-[#f0807f]'}`}>
              Home
            </a>
            <a href="/about" className={`font-medium transition-colors duration-400 ${isScrolled ? 'text-[black] hover:text-[#f0807f]' : 'text-black hover:text-[#f0807f]'}`}>
              About
            </a>
            <a href="/music" className={`font-medium transition-colors duration-400 ${isScrolled ? 'text-[black] hover:text-[#f0807f]' : 'text-black hover:text-[#f0807f]'}`}>
              Music
            </a>
            <a href="/contact" className={`font-medium transition-colors duration-400 ${isScrolled ? 'text-[black] hover:text-[#f0807f]' : 'text-black hover:text-[#f0807f]'}`}>
              Contact
            </a>
          </nav>

          {/* Mobile Hamburger Button */}
          <button 
            onClick={toggleMobileMenu}
            className={`md:hidden focus:outline-none transition-colors duration-400 ${isScrolled ? 'text-[#9966cb]' : 'text-[#9966cb]'} z-60`}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={closeMobileMenu}
          ></div>
          
          {/* Mobile Menu */}
          <nav className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out pt-20">
            <div className="flex flex-col space-y-4 p-6">
              <a 
                href="/" 
                className="text-black hover:text-[#f0807f] font-medium py-2 transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                Home
              </a>
              <a 
                href="/about" 
                className="text-black hover:text-[#f0807f] font-medium py-2 transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                About
              </a>
              <a 
                href="/music" 
                className="text-black hover:text-[#f0807f] font-medium py-2 transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                Music
              </a>
              <a 
                href="/contact" 
                className="text-black hover:text-[#f0807f] font-medium py-2 transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                Contact
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;