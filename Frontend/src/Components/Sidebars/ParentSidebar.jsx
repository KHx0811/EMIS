import React, { useState, useEffect } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { LogOut, User, BookOpen, Calendar, CreditCard, Bell } from 'lucide-react';
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminSidebar.css';

const ParentSidebar = ({ onMenuItemClick, currentMenuItem }) => {
  const navigate = useNavigate();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [parentName, setParentName] = useState('Parent');
  const [children, setChildren] = useState([]);

  useEffect(() => {
      if (currentMenuItem) {
        if (currentMenuItem.includes('Profile')) {
          setOpenSubmenu('Profile');
        } else if (currentMenuItem.includes('Atendence')) {
          setOpenSubmenu('Attendence');
        } else if (currentMenuItem.includes('Marks')) {
          setOpenSubmenu('Internal Marks');
        } else if (currentMenuItem.includes('Teacher')) {
          setOpenSubmenu('Teachers');
        } else if (currentMenuItem.includes('Fees')) {
          setOpenSubmenu('Feedues');
        } else if (currentMenuItem.includes('Activities')) {
          setOpenSubmenu('Activities');
        } else if (currentMenuItem.includes('Events')) {
          setOpenSubmenu('School Events');
        } else if (currentMenuItem.includes('PT Meetings')) {
          setOpenSubmenu('Parent Teacher Meetings');
        }
      }
    }, [currentMenuItem]);
  

  const fetchParentDetails = async () => {
    try {

      const storedName = localStorage.getItem('parentName');

      if(storedName){
        setParentName(storedName);
        return;
      }
      const token = localStorage.getItem('parentToken');
      if (!token) return;
      const response = await axios.get('http://localhost:3000/api/teachers/details', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.data && response.data.data.name) {
        setName(response.data.data.name);
        localStorage.setItem('adminName', response.data.data.name);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      tryExtractNameFromToken();
    }

  };

  const tryExtractNameFromToken = () => {
    try {
      const token = localStorage.getItem('parentToken');
      if (!token) return;
      
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return;
      
      const payload = JSON.parse(atob(tokenParts[1]));
      if (payload.name) {
        setAdminName(payload.name);
        localStorage.setItem('parentName', payload.name);
      }
    } catch (e) {
      console.error('Error extracting username from token:', e);
    }
  };

  const handleSubmenuClick = (label) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  const handleLogout = () => {
    localStorage.removeItem('parentToken');
    localStorage.removeItem('parentName');
    navigate('/login/parent');
  };

  const handleDashboardClick = () => {
    onMenuItemClick('dashboard');
  };

  return (
    <Box
      className="parent-sidebar-wrapper"
      sx={{
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
        }}
        width="220px"
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
              {parentName}
            </Typography>
            <Typography variant="body2" sx={{ color: '#00deb6', margin: '2px 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
              Parent
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
              onClick={handleDashboardClick} 
              active={currentMenuItem === 'dashboard'}
              icon={<User size={18} />}
            >
              Dashboard
            </MenuItem>

            {children.map((child) => (
              <SubMenu
                key={child._id}
                label={child.name}
                icon={<BookOpen size={18} />}
                open={openSubmenu === child.name}
                onClick={() => handleSubmenuClick(child.name)}
              >
                <MenuItem 
                  onClick={() => onMenuItemClick(`childProfile:${child._id}`)}
                  active={currentMenuItem === `childProfile:${child._id}`}
                >
                  Profile
                </MenuItem>
                <MenuItem 
                  onClick={() => onMenuItemClick(`childMarks:${child._id}`)}
                  active={currentMenuItem === `childMarks:${child._id}`}
                >
                  Academic Performance
                </MenuItem>
                <MenuItem 
                  onClick={() => onMenuItemClick(`childAttendance:${child._id}`)}
                  active={currentMenuItem === `childAttendance:${child._id}`}
                >
                  Attendance
                </MenuItem>
                <MenuItem 
                  onClick={() => onMenuItemClick(`childEvents:${child._id}`)}
                  active={currentMenuItem === `childEvents:${child._id}`}
                >
                  School Events
                </MenuItem>
              </SubMenu>
            ))}

            <MenuItem 
              onClick={() => onMenuItemClick('fees')}
              active={currentMenuItem === 'fees'}
              icon={<CreditCard size={18} />}
            >
              Fee Management
            </MenuItem>

            <MenuItem 
              onClick={() => onMenuItemClick('meetings')}
              active={currentMenuItem === 'meetings'}
              icon={<Calendar size={18} />}
            >
              Parent-Teacher Meetings
            </MenuItem>

            <MenuItem 
              onClick={() => onMenuItemClick('notifications')}
              active={currentMenuItem === 'notifications'}
              icon={<Bell size={18} />}
            >
              Notifications
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
    </Box>
  );
};

export default ParentSidebar;