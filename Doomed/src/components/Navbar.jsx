import React, { useState, useContext } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

import { FaGear, FaUser, FaArrowRightFromBracket } from 'react-icons/fa6';
import { ThemeContext } from '../App.js';
import './Navbar.css';

// Import your menuItems configuration (from sidebar or shared config)
const menuItems = [
    {
      title: "Clients",
      subItems: [
        { title: "Total Clients", path: "/command1" },
        { title: "New Clients", path: "/command2" },
        { title: "Nationality Breakdown", path: "/command7" }
      ]
    },
    {
      title: "Memberships",
      subItems: [
        { title: "Total Memberships", path: "/command3" },
        { title: "New Memberships", path: "/command4" },
      ]
    },
    {
      title: "Analytics",
      subItems: [
        { title: "Membership Vs Clients", path: "/command5" },
        { title: "Membership Tiers", path: "/command6" },
        { title: "Member Birthdays", path: "/command8" },
        { title: "Age Range", path: "/command9" },
        { title: "Top Spenders", path: "/command10" }

      ]
    }
  ];

export const Navbar = () => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add any logout logic here (clear tokens, etc.)
    navigate('/login');
  };
  
  // Get current breadcrumb path
  const getBreadcrumb = () => {
    const currentPath = location.pathname;
    
    // Handle overview page
    if (currentPath === "/") return ["Overview"];
  
    // Check all menu items and subitems
    for (const section of menuItems) {
      // Check subitems first
      if (section.subItems) {
        const foundSubItem = section.subItems.find(item => item.path === currentPath);
        if (foundSubItem) return [section.title, foundSubItem.title];
      }
      
      // Check if it's a main section path (optional - add if you have section pages)
      // if (section.path === currentPath) return [section.title];
    }
  
    // Fallback for unknown paths
    const pathSegments = currentPath.split('/').filter(Boolean);
    return pathSegments.map(segment => 
      segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
  };

  const breadcrumb = getBreadcrumb();

  return (
    <nav className="navbar">
      <div className="breadcrumb">
        {breadcrumb.map((item, index) => (
          <span key={index} className="breadcrumb-item">
            {item}
            {index < breadcrumb.length - 1 && (
              <span className="separator">›</span>
            )}
          </span>
        ))}
      </div>
      
      <div className="navbar-settings">
        <FaGear className="settings-icon" onClick={() => setShowDropdown(!showDropdown)}/>
        
        {showDropdown && (
          <div className={`settings-dropdown ${darkMode ? 'dark' : ''}`}>
            <label className="theme-switch">
              <input 
                type="checkbox" 
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
              <span className="slider"></span>
              <span className="theme-label">Dark Mode</span>
            </label>
            <label className="language-switch">
              <select>
                <option value="en">English</option>
                <option value="mm">Burmese</option>
              </select>
            </label>
          </div>
        )}

        <div className="navbar-admin">
          <FaUser 
            className="admin-btn"
            onClick={() => {
              setShowAdminDropdown(!showAdminDropdown);
              setShowDropdown(false);
            }}
          />
          
          {showAdminDropdown && (
            <div className={`admin-dropdown ${darkMode ? 'dark' : ''}`}>
              <button className="logout-btn" onClick={handleLogout}>
                <FaArrowRightFromBracket className="dropdown-icon" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};