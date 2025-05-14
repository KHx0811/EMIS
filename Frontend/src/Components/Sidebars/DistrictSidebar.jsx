import React, { useState, useEffect } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { LogOut, Search, DollarSign, FilePlus, MessageSquare, Activity, FileText, Send } from 'lucide-react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import './AdminSidebar.css';

const DistrictSidebar = ({ onMenuItemClick, currentMenuItem }) => {
  const navigate = useNavigate();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [districtHeadName, setDistrictHeadName] = useState('District Head');

  useEffect(() => {
    if (currentMenuItem) {
      if (currentMenuItem.includes('schoolSearch') || currentMenuItem.includes('teacherSearch') || currentMenuItem.includes('studentSearch')) {
        setOpenSubmenu('Search');
      } else if (currentMenuItem.includes('budgets')) {
        setOpenSubmenu('Budgets');
      } else if (currentMenuItem.includes('meetings')) {
        setOpenSubmenu('Meetings');
      } else if (currentMenuItem.includes('exams')) {
        setOpenSubmenu('Exams');
      } else if (currentMenuItem.includes('contactAdmin')) {
        setOpenSubmenu('Contact Admin');
      }
    }
  }, [currentMenuItem]);

  const fetchUserDetails = async () => {
    try {
      const storedName = localStorage.getItem('districtHeadName');
      if (storedName) {
        setDistrictHeadName(storedName);
        return;
      }

      const token = localStorage.getItem('districtToken');
      if (!token) return;

      const response = await axios.get('http://localhost:3000/api/districts/details', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setDistrictHeadName(response.data.data);
        localStorage.setItem('districtHeadName', response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      tryExtractUsernameFromToken();
    }
  };

  const tryExtractUsernameFromToken = () => {
    try {
      const token = localStorage.getItem('districtToken');
      if (!token) return;

      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return;

      const payload = JSON.parse(atob(tokenParts[1]));
      if (payload.username) {
        setDistrictHeadName(payload.username);
        localStorage.setItem('districtHeadUsername', payload.username);
      }
    } catch (e) {
      console.error('Error extracting username from token:', e);
    }
  };

  const handleSubmenuClick = (label) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  const handleLogout = () => {
    localStorage.removeItem('districtToken');
    localStorage.removeItem('districtUsername');
    localStorage.removeItem('userType');
    navigate('/login/district');
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
      className="district-sidebar-wrapper"
      style={{
        position: 'relative',
        height: '100vh',
        backgroundColor: '#141b2d !important',
        boxShadow: '2px 0px 10px rgba(15, 19, 34, 0.6)',
        '& *': {
          backgroundColor: 'inherit',
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
            backgroundColor: '#141b2d !important',
          }}
        >
          <Box
            sx={{
              textAlign: 'center',
              backgroundColor: '#141b2d !important',
              cursor: 'pointer',
            }}
            onClick={() => onMenuItemClick('profile')}
          >
            <Typography active={currentMenuItem === 'profile'} variant="h6" sx={{ color: '#ffffff', margin: '8px 0 0 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {districtHeadName}
            </Typography>
            <Typography variant="body2" sx={{ color: '#00deb6', margin: '2px 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
              District Head
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
                },
              }),
              icon: {
                color: '#00deb6',
              },
              subMenuContent: {
                backgroundColor: '#141b2d !important',
              },
            }}
            rootStyles={{
              backgroundColor: '#141b2d !important',
            }}
          >
            <SubMenu 
              label="Search" 
              icon={<Search size={18} />}
              open={openSubmenu === 'Search'}
              onClick={() => handleSubmenuClick('Search')}
            >
              <MenuItem
                onClick={() => onMenuItemClick('schoolSearch')}
                active={currentMenuItem === 'schoolSearch'}
              >
                School Details
              </MenuItem>
              <MenuItem
                onClick={() => onMenuItemClick('teacherSearch')}
                active={currentMenuItem === 'teacherSearch'}
              >
                Teacher Details
              </MenuItem>
              <MenuItem
                onClick={() => onMenuItemClick('studentSearch')}
                active={currentMenuItem === 'studentSearch'}
              >
                Student Details
              </MenuItem>
            </SubMenu>

            <MenuItem
              onClick={() => onMenuItemClick('budgets')}
              active={currentMenuItem === 'budgets'}
              icon={<DollarSign size={18} />}
            >
              Budgets
            </MenuItem>
            
            <MenuItem
              onClick={() => onMenuItemClick('meetings')}
              active={currentMenuItem === 'meetings'}
              icon={<MessageSquare size={18} />}
            >
              Meetings
            </MenuItem>
            
            <MenuItem
              onClick={() => onMenuItemClick('exams')}
              active={currentMenuItem === 'exams'}
              icon={<FileText size={18} />}
            >
              Exams
            </MenuItem>
            <MenuItem
              onClick={() => onMenuItemClick('contactAdmin')}
              active={currentMenuItem === 'contactAdmin'}
              icon={<Send size={18} />}
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
            fontWeight: 'bold',
          }}
        >
          <LogOut size={18} style={{ marginRight: '8px' }} />
          Logout
        </button>
      </Box>
    </ResizableBox>
  );
};

export default DistrictSidebar;