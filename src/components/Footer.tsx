
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Info, MessageSquare } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";

const Footer = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isAboutPage = location.pathname === "/about";
  const isFeedbackPage = location.pathname === "/feedback";

  return (
    <footer className="mt-8 space-y-8">
      <div className="flex justify-center">
        <ThemeSwitcher />
      </div>
      
      <nav className="flex flex-wrap justify-center gap-x-6 gap-y-4">
        {!isHomePage && (
          <Link to="/" className="inline-flex items-center gap-2 text-foreground hover:text-primary whitespace-nowrap">
            <Home className="h-4 w-4" />
            Home
          </Link>
        )}
        {!isAboutPage && (
          <Link to="/about" className="inline-flex items-center gap-2 text-foreground hover:text-primary whitespace-nowrap">
            <Info className="h-4 w-4" />
            About
          </Link>
        )}
        {!isFeedbackPage && (
          <Link to="/feedback" className="inline-flex items-center gap-2 text-foreground hover:text-primary whitespace-nowrap">
            <MessageSquare className="h-4 w-4" />
            Feedback
          </Link>
        )}
      </nav>

      <div className="text-center text-sm text-muted-foreground">
        Built with ❤️ by{" "}
        <a 
          href="https://toolyoulove.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Tool You Love
        </a>
      </div>
    </footer>
  );
};

export default Footer;
