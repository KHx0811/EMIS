import React, { useState, useEffect } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { LogOut, User, Calendar, FileText, Activity, MessageSquare, FilePlus } from 'lucide-react';
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import './AdminSidebar.css';

const TeacherSidebar = ({ onMenuItemClick, currentMenuItem }) => {
  const navigate = useNavigate();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [teacherName, setTeacherName] = useState('Teacher');

  useEffect(() => {
    if (currentMenuItem) {
      if (currentMenuItem.includes('Profile')) {
        setOpenSubmenu('Profile');
      } else if (currentMenuItem.includes('Search Student')) {
        setOpenSubmenu('Search Student');
      } else if (currentMenuItem.includes('Attendance')) {
        setOpenSubmenu('Attendance');
      } else if (currentMenuItem.includes('Marks')) {
        setOpenSubmenu('Marks');
      } else if (currentMenuItem.includes('Assignments')) {
        setOpenSubmenu('Assignments');
      } else if (currentMenuItem.includes('Events')) {
        setOpenSubmenu('School Events');
      } else if (currentMenuItem.includes('Parent Interaction')) {
        setOpenSubmenu('Parent Interaction');
      } else if (currentMenuItem.includes('Leave')) {
        setOpenSubmenu('Leave');
      } else if (currentMenuItem.includes('Contact Admin')) {
        setOpenSubmenu('Contact Admin');
      }
    }
  }, [currentMenuItem]);

  const fetchUserDetails = async () => {
    try {      
      const token = localStorage.getItem('teacherToken');
      if (!token) {
        console.error('No token found');
        return;
      }
      
      const response = await axios.get('http://localhost:3000/api/teachers/details', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data) {
        setTeacherName(response.data);
        localStorage.setItem('teacherName', response.data);
      }
    } catch (error) {
      console.error('Error fetching user details:', error.response ? error.response.data : error.message);
      tryExtractUsernameFromToken();
    }
  };

  const tryExtractUsernameFromToken = () => {
    try {
      const token = localStorage.getItem('teacherToken');
      if (!token) return;
      
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return;
      
      const payload = JSON.parse(atob(tokenParts[1]));
      if (payload.name) {
        setTeacherName(payload.name);
        localStorage.setItem('teacherUsername', payload.name);
      }
    } catch (e) {
      console.error('Error extracting username from token:', e);
    }
  };

  const handleSubmenuClick = (label) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  const handleLogout = () => {
    localStorage.removeItem('teacherToken');
    localStorage.removeItem('teacherUsername');
    navigate('/login/teacher');
  };

  const handleDashboardClick = () => {
    onMenuItemClick('dashboard');
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <ResizableBox
      width={220}
      height={Infinity}
      minConstraints={[220, Infinity]}
      maxConstraints={[window.innerWidth * 0.5, Infinity]}
      axis="x"
      handle={<span className="custom-handle custom-handle-x" />}
      resizeHandles={['e']}
      className="teacher-sidebar-wrapper"
      style={{
        position: 'relative',
        height: '100vh',
        backgroundColor: '#141b2d !important',
        boxShadow: '2px 0px 10px rgba(15, 19, 34, 0.6)',
        '& *': {
          backgroundColor: 'inherit'
        },
      }}
    >
      <Sidebar
        rootStyles={{
          height: '100%',
          border: 'none',
          backgroundColor: '#141b2d !important',
          position: 'relative',
          color: '#ffffff',
          '& .ps-sidebar-container': {
            backgroundColor: '#141b2d !important'
          },
          '& .ps-menu-root': {
            backgroundColor: '#141b2d !important'
          },
          '& [data-testid="ps-sidebar-container-test-id"]': {
            backgroundColor: '#141b2d !important'
          },
          '& .MuiBox-root': {
            backgroundColor: '#141b2d !important'
          }
        }}
        width="100%"
      >
        <Box 
          sx={{
            padding: '20px 15px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: '#141b2d !important'
          }}
        >
          <Box 
            sx={{ 
              textAlign: 'center', 
              backgroundColor: '#141b2d !important',
              cursor: 'pointer'
            }}
            onClick={handleDashboardClick}
          >
            <Typography variant="h6" sx={{ color: '#ffffff', margin: '8px 0 0 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {teacherName}
            </Typography>
            <Typography variant="body2" sx={{ color: '#00deb6', margin: '2px 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
              Teacher
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2, backgroundColor: '#141b2d !important' }}>
          <Menu
            menuItemStyles={{
              button: ({ level, active }) => ({
                color: '#ffffff',
                backgroundColor: active ? 'rgba(0, 222, 182, 0.2)' : 'transparent',
                margin: '4px 8px',
                borderRadius: '6px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 222, 182, 0.1)',
                  color: '#00deb6',
                }
              }),
              icon: {
                color: '#00deb6'
              },
              subMenuContent: {
                backgroundColor: '#141b2d !important'
              }
            }}
            rootStyles={{
              backgroundColor: '#141b2d !important',
            }}
          >

            <MenuItem 
              onClick={() => onMenuItemClick('profile')}
              active={currentMenuItem === 'profile'}
              icon={<User size={18} />}
            >
              Profile
            </MenuItem>
            <MenuItem 
              onClick={() => onMenuItemClick('search student')}
              active={currentMenuItem === 'search student'}
              icon={<Activity size={18} />}
            >
              Search Student
            </MenuItem>

            <MenuItem 
              onClick={() => onMenuItemClick('attendance')}
              active={currentMenuItem === 'attendance'}
              icon={<Calendar size={18} />}
            >
              Upload Attendance
            </MenuItem>

            <MenuItem 
              onClick={() => onMenuItemClick('marks')}
              active={currentMenuItem === 'marks'}
              icon={<FileText size={18} />}
            >
              Upload Marks
            </MenuItem>

            <MenuItem 
              onClick={() => onMenuItemClick('assignments')}
              active={currentMenuItem === 'assignments'}
              icon={<FilePlus size={18} />}
            >
              Assignments
            </MenuItem>

            <MenuItem 
              onClick={() => onMenuItemClick('events')}
              active={currentMenuItem === 'events'}
              icon={<Calendar size={18} />}
            >
              School Events
            </MenuItem>

            <MenuItem 
              onClick={() => onMenuItemClick('parentInteraction')}
              active={currentMenuItem === 'parentInteraction'}
              icon={<MessageSquare size={18} />}
            >
              Parent Interaction
            </MenuItem>

            <MenuItem 
              onClick={() => onMenuItemClick('leave')}
              active={currentMenuItem === 'leave'}
              icon={<Calendar size={18} />}
            >
              Apply Leave
            </MenuItem>
            <MenuItem 
              onClick={() => onMenuItemClick('Contact Admin')}
              active={currentMenuItem === 'Contact Admin'}
              icon={<FileText size={18} />}
            >
              Contact Admin
            </MenuItem>
          </Menu>
        </Box>
      </Sidebar>

      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          width: '100%',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          marginTop: 'auto',
          backgroundColor: '#141b2d !important',
          zIndex: 10,
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '12px 16px',
            backgroundColor: 'rgba(31, 42, 64, 0.5)',
            color: '#00deb6',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          <LogOut size={18} style={{ marginRight: '8px' }} />
          Logout
        </button>
      </Box>
    </ResizableBox>
  );
};

export default TeacherSidebar;