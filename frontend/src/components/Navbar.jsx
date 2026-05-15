import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, BookOpen, User } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Academics', path: '/academics' },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Faculty', path: '/faculty' },
    { name: 'Notices', path: '/notices' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left Side Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img src="/hnp-logo.jpg" alt="HNP Institute" className="h-10 w-10 sm:h-12 sm:w-12 object-contain bg-white rounded-sm" />
            <Link to="/" className="text-lg sm:text-xl lg:text-2xl font-bold tracking-wider">HNP Institute</Link>
          </div>
          
          {/* Right Side Items */}
          <div className="flex items-center justify-end">
            {/* Desktop Links & Buttons */}
            <div className="hidden lg:flex items-center space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="hover:bg-blue-800 hover:text-white px-2 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              {token ? (
                <div className="flex items-center space-x-2 ml-2">
                  {role === 'admin' && (
                    <Link
                      to="/admin"
                      className="bg-blue-800 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-blue-600"
                    >
                      Admin
                    </Link>
                  )}
                  {role === 'student' && (
                    <Link
                      to="/student"
                      className="bg-blue-800 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-blue-600"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors ml-2"
                >
                  <User className="h-4 w-4 mr-1" />
                  Login
                </Link>
              )}
            </div>

            {/* Logo and Mobile Menu */}
            <div className="flex items-center space-x-2 sm:space-x-3 ml-auto lg:ml-4 lg:pl-4 lg:border-l lg:border-blue-700">
              <img src="/mira-logo.jpg" alt="Mira Educational Trust" className="h-10 w-10 sm:h-12 sm:w-12 object-contain bg-white rounded-full" />
              
              <div className="flex lg:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="inline-flex items-center justify-center p-1 sm:p-2 rounded-md text-gray-300 hover:text-white hover:bg-blue-800 focus:outline-none"
                >
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="hover:bg-blue-800 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {token ? (
              <>
                {role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-left hover:bg-blue-800 block px-3 py-2 rounded-md text-base font-medium text-blue-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                {role === 'student' && (
                  <Link
                    to="/student"
                    className="text-left hover:bg-blue-800 block px-3 py-2 rounded-md text-base font-medium text-blue-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="w-full text-left bg-red-600 hover:bg-red-700 block px-3 py-2 rounded-md text-base font-medium mt-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="hover:bg-blue-800 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
