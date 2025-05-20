import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-teal-950 text-white shadow-md z-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center space-x-2"
            onClick={closeMenu}
          >
            <img
              src="https://www.pngmart.com/files/22/Sri-Lanka-Flag-PNG-Photo.png"
              alt="Sri Lanka Emblem"
              className="h-8 w-8 "
        
            />
            <span className="font-bold text-xl md:text-2xl">
              SL Election Commission
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <NavLink to="/" isActive={isActiveLink("/")}>
              Home
            </NavLink>
            <NavLink to="/results" isActive={isActiveLink("/results")}>
              Results
            </NavLink>
            <NavLink to="/admin" isActive={isActiveLink("/admin")}>
              Admin Panel
            </NavLink>
            <NavLink to="/about" isActive={isActiveLink("/about")}>
              About
            </NavLink>
            <NavLink to="/contact" isActive={isActiveLink("/contact")}>
              Contact
            </NavLink>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden focus:outline-none"
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`
        fixed inset-y-0 right-0 z-50 w-64 bg-teal-950 shadow-lg transform transition-transform duration-300 ease-in-out
        ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
      `}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={closeMenu}
            className="focus:outline-none"
            aria-label="Close Menu"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="flex flex-col space-y-4 p-4">
          <MobileNavLink
            to="/"
            isActive={isActiveLink("/")}
            onClick={closeMenu}
          >
            Home
          </MobileNavLink>
          <MobileNavLink
            to="/results"
            isActive={isActiveLink("/results")}
            onClick={closeMenu}
          >
            Results
          </MobileNavLink>
          <MobileNavLink
            to="/admin"
            isActive={isActiveLink("/admin")}
            onClick={closeMenu}
          >
            Admin Panel
          </MobileNavLink>
          <MobileNavLink
            to="/about"
            isActive={isActiveLink("/about")}
            onClick={closeMenu}
          >
            About
          </MobileNavLink>
          <MobileNavLink
            to="/contact"
            isActive={isActiveLink("/contact")}
            onClick={closeMenu}
          >
            Contact
          </MobileNavLink>
          <button
            className="text-gray-400 cursor-not-allowed py-2"
            title="Coming soon"
          >
            Login/Signup
          </button>
        </nav>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-teal bg-opacity-50 z-40 md:hidden"
          onClick={closeMenu}
        ></div>
      )}
    </header>
  );
};

interface NavLinkProps {
  to: string;
  isActive: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, isActive, children }) => {
  return (
    <Link
      to={to}
      className={`transition duration-300 ease-in-out hover:text-[#10B981] ${
        isActive ? "font-semibold border-b-2 border-[#10B981]" : ""
      }`}
    >
      {children}
    </Link>
  );
};

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({
  to,
  isActive,
  onClick,
  children,
}) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`py-2 transition duration-300 ease-in-out hover:text-[#10B981] ${
        isActive ? "font-semibold border-b border-[#10B981]" : ""
      }`}
    >
      {children}
    </Link>
  );
};

export default Header;
