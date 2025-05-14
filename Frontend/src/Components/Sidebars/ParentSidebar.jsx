import React, { useState, useEffect } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { LogOut, User, BookOpen, Calendar, CreditCard, Bell, MessageSquare, FileText, Users, Phone } from 'lucide-react'; // Updated imports
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ResizableBox } from 'react-resizable';
import config from '@/assets/config';

const { url } = config;

const ParentSidebar = ({ onMenuItemClick, currentMenuItem }) => {
  const navigate = useNavigate();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [parentName, setParentName] = useState('');

  useEffect(() => {
      if (currentMenuItem) {
        if (currentMenuItem.includes('Child Profile')) {
          setOpenSubmenu('Child Profile');
        } else if (currentMenuItem.includes('Attendance')) {
          setOpenSubmenu('Attendance');
        } else if (currentMenuItem.includes('Marks')) {
          setOpenSubmenu('Marks');
        } else if (currentMenuItem.includes('Teachers')) {
          setOpenSubmenu('Teachers');
        } else if (currentMenuItem.includes('Fees')) {
          setOpenSubmenu('Feedues');
        } else if (currentMenuItem.includes('Events')) {
          setOpenSubmenu('School Events');
        } else if (currentMenuItem.includes('PT Meetings')) {
          setOpenSubmenu('Parent Teacher Meetings');
        } else if (currentMenuItem.includes('Contact Admin')) {
          setOpenSubmenu('Contact Admin');
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
      const response = await axios.get(`${url}/api/parents/details`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setParentName(response.data.data);
        console.log('Parent Name:', response.data.data);
        localStorage.setItem('parentUserName', response.data.data);
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
        setParentName(payload.name);
        localStorage.setItem('parentUserName', payload.name);
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
    localStorage.removeItem('userType');
    navigate('/login/parent');
  };

  const handleDashboardClick = () => {
    onMenuItemClick('dashboard');
  };

  useEffect(() => {
    fetchParentDetails();
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
      className="parent-sidebar-wrapper"
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
            onClick={() => onMenuItemClick('profile')}
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
              onClick={() => onMenuItemClick('childProfile')}
              active={currentMenuItem === 'childProfile'}
              icon={<BookOpen size={18} />}
            >
              Child Profile
            </MenuItem>
            <MenuItem 
              onClick={() => onMenuItemClick('Attendance')}
              active={currentMenuItem === 'Attendance'}
              icon={<Calendar size={18} />}
            >
              Attendance
            </MenuItem>
            <MenuItem 
              onClick={() => onMenuItemClick('Marks')}
              active={currentMenuItem === 'Marks'}
              icon={<FileText size={18} />}
            >
              Marks
            </MenuItem>
            <MenuItem 
              onClick={() => onMenuItemClick('Teachers')}
              active={currentMenuItem === 'Teachers'}
              icon={<Users size={18} />}
            >
              Teachers
            </MenuItem>
            <MenuItem 
              onClick={() => onMenuItemClick('Fees')}
              active={currentMenuItem === 'Feedues'}
              icon={<CreditCard size={18} />}
            >
              Feedues
            </MenuItem>
            <MenuItem 
              onClick={() => onMenuItemClick('Events')}
              active={currentMenuItem === 'Events'}
              icon={<Calendar size={18} />}
            >
              School Events
            </MenuItem>
            <MenuItem 
              onClick={() => onMenuItemClick('PT Meetings')}
              active={currentMenuItem === 'PT Meetings'}
              icon={<Users size={18} />}
            >
              PT Meetings
            </MenuItem>
            <MenuItem 
              onClick={() => onMenuItemClick('Contact Admin')}
              active={currentMenuItem === 'Contact Admin'}
              icon={<Phone size={18} />}
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

export default ParentSidebar;