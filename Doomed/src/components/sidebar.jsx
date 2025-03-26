import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BiHomeHeart, BiFace, BiCreditCard, BiBarChartAlt } from 'react-icons/bi';
import './sidebar.css';


const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState({
    clients: false,
    memberships: false,
    analytics: false
  });

const menuItems = [
    {
      title: "Clients",
      subItems: [
        { title: "Total Clients", path: "/command1" },
        { title: "New Clients", path: "/command2" },
      ]
    },
    {
      title: "Memberships",
      subItems: [
        { title: "Nationality Breakdown", path: "/command7" },
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

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <aside className="sidebar">
      <NavLink to="/dashboard" className="logo">
        <img src="/dashaii.png" alt="CiMSO Logo" className="logo-img" />
      </NavLink>
      
      <ul>
        <li>
          <NavLink 
            to="/"
            end
            className={({ isActive }) => isActive ? "menu-button active" : "menu-button"}
          >
            <BiHomeHeart className="menu-icon" />
            Overview
          </NavLink>
        </li>

        {menuItems.map((section, index) => (
          <li key={index} className="menu-section">
            <button 
              className="menu-header"
              onClick={() => toggleMenu(section.title.toLowerCase())}
            >
              {section.title === "Clients" && <BiFace className="menu-icon" />}
              {section.title === "Memberships" && <BiCreditCard className="menu-icon" />}
              {section.title === "Analytics" && <BiBarChartAlt className="menu-icon" />}
              <span>{section.title}</span>
              <svg
                className={`chevron ${openMenus[section.title.toLowerCase()] ? 'open' : ''}`}
                viewBox="0 0 24 24"
                width="16"
                height="16"
              >
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
              </svg>
            </button>
            
            {openMenus[section.title.toLowerCase()] && (
              <ul className="submenu">
                {section.subItems.map((item, idx) => (
                  <li key={idx}>
                    <NavLink 
  to={item.path}
  className={({ isActive }) => isActive ? "submenu-item active" : "submenu-item"}
>
  {item.title}
</NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;