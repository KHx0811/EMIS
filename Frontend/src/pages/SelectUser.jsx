import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarHome from '../Components/NavbarHome';
import './SelectUser.css';

const url = import.meta.env.URL;


const SelectUser = () => {
  const navigate = useNavigate();
  const [hoveredRole, setHoveredRole] = useState(null);

  const roles = [
    {
      id: 'parent',
      name: 'Parent',
      color: '#3498db',
      path: '/login/parent',
      description: 'Monitor student progress & communicate with teachers',
      icon: '👪',
      position: 'top-left'
    },
    {
      id: 'principal',
      name: 'Principal',
      color: '#9b59b6',
      path: '/login/principal',
      description: 'Oversee school operations & staff management',
      icon: '🏫',
      position: 'top-right'
    },
    {
      id: 'teacher',
      name: 'Teacher',
      color: '#2ecc71',
      path: '/login/teacher',
      description: 'Manage classrooms & track student performance',
      icon: '📚',
      position: 'bottom-left'
    },
    {
      id: 'district',
      name: 'District Head',
      color: '#e74c3c',
      path: '/login/district',
      description: 'Coordinate multiple schools & district policies',
      icon: '🏢',
      position: 'bottom-right'
    }
  ];

  const adminRole = {
    id: 'admin',
    name: 'Admin',
    color: '#34495e',
    path: '/login/admin',
    description: 'Complete system access & configuration',
    icon: '⚙️'
  };

  return (
    <div className="select-user-container">
      <div className="navbar">
        <NavbarHome />
      </div>

      <div className="role-selection-container">
        <div className="role-grid">
          <div className="role-card-wrapper top-left">
            <div
              className={`role-card ${hoveredRole === 'parent' ? 'role-hovered' : ''}`}
              style={{ '--role-color': roles[0].color }}
              onClick={() => navigate(roles[0].path)}
              onMouseEnter={() => setHoveredRole('parent')}
              onMouseLeave={() => setHoveredRole(null)}
            >
              <div className="card-content-1">
                <div className="role-icon-corner top-left-icon" style={{ background: `linear-gradient(135deg, ${roles[0].color} 0%, ${adjustColor(roles[0].color, -30)} 100%)` }}>
                  {roles[0].icon}
                </div>
                <h3>{roles[0].name}</h3>
                <p>{roles[0].description}</p>
              </div>
            </div>
            <div
              className={`connection-line ${hoveredRole === 'parent' || hoveredRole === 'admin' ? 'connection-active' : ''}`}
              style={{ '--line-color': roles[0].color }}
            ></div>
          </div>

          <div className="role-card-wrapper top-right">
            <div
              className={`role-card ${hoveredRole === 'principal' ? 'role-hovered' : ''}`}
              style={{ '--role-color': roles[1].color }}
              onClick={() => navigate(roles[1].path)}
              onMouseEnter={() => setHoveredRole('principal')}
              onMouseLeave={() => setHoveredRole(null)}
            >
              <div className="card-content-2">
                <div className="role-icon-corner-diff top-right-icon" style={{ background: `linear-gradient(135deg, ${roles[1].color} 0%, ${adjustColor(roles[1].color, -30)} 100%)` }}>
                  {roles[1].icon}
                </div>
                <h3>{roles[1].name}</h3>
                <p>{roles[1].description}</p>
              </div>
            </div>
            <div
              className={`connection-line ${hoveredRole === 'principal' || hoveredRole === 'admin' ? 'connection-active' : ''}`}
              style={{ '--line-color': roles[1].color }}
            ></div>
          </div>

          <div className="admin-wrapper">
            <div
              className={`admin-role ${hoveredRole === 'admin' ? 'role-hovered' : ''}`}
              onClick={() => navigate(adminRole.path)}
              onMouseEnter={() => setHoveredRole('admin')}
              onMouseLeave={() => setHoveredRole(null)}
            >
              <div className="role-icon">{adminRole.icon}</div>
              <h2>{adminRole.name}</h2>
            </div>
          </div>

          <div className="role-card-wrapper bottom-left">
            <div
              className={`role-card ${hoveredRole === 'teacher' ? 'role-hovered' : ''}`}
              style={{ '--role-color': roles[2].color }}
              onClick={() => navigate(roles[2].path)}
              onMouseEnter={() => setHoveredRole('teacher')}
              onMouseLeave={() => setHoveredRole(null)}
            >
              <div className="card-content-3">
                <div className="role-icon-corner bottom-left-icon" style={{ background: `linear-gradient(135deg, ${roles[2].color} 0%, ${adjustColor(roles[2].color, -30)} 100%)` }}>
                  {roles[2].icon}
                </div>
                <h3>{roles[2].name}</h3>
                <p>{roles[2].description}</p>
              </div>
            </div>
            <div
              className={`connection-line ${hoveredRole === 'teacher' || hoveredRole === 'admin' ? 'connection-active' : ''}`}
              style={{ '--line-color': roles[2].color }}
            ></div>
          </div>

          <div className="role-card-wrapper bottom-right">
            <div
              className={`role-card ${hoveredRole === 'district' ? 'role-hovered' : ''}`}
              style={{ '--role-color': roles[3].color }}
              onClick={() => navigate(roles[3].path)}
              onMouseEnter={() => setHoveredRole('district')}
              onMouseLeave={() => setHoveredRole(null)}
            >
              <div className="card-content-4">
                <div className="role-icon-corner-diff bottom-right-icon" style={{ background: `linear-gradient(135deg, ${roles[3].color} 0%, ${adjustColor(roles[3].color, -30)} 100%)` }}>
                  {roles[3].icon}
                </div>
                <h3>{roles[3].name}</h3>
                <p>{roles[3].description}</p>
              </div>
            </div>
            <div
              className={`connection-line ${hoveredRole === 'district' || hoveredRole === 'admin' ? 'connection-active' : ''}`}
              style={{ '--line-color': roles[3].color }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

function adjustColor(color, amount) {
  return '#' + color.replace(/^#/, '').replace(/../g, color =>
    ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
  );
}

export default SelectUser;