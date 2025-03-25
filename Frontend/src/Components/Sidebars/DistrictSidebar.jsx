import React, { useState, useEffect } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { LogOut, User, Search, Calendar, FileText, Activity, MessageSquare, FilePlus, DollarSign, BarChart2 } from 'lucide-react';
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminSidebar.css';

const DistrictSidebar = ({ onMenuItemClick, currentMenuItem }) => {
  const navigate = useNavigate();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [districtName, setDistrictName] = useState('District Head');

  useEffect(() => {
    if (currentMenuItem) {
      if (currentMenuItem.includes('Profile')) {
        setOpenSubmenu('Profile');
      } else if (currentMenuItem.includes('SchoolSearch')) {
        setOpenSubmenu('School Search');
      } else if (currentMenuItem.includes('Budgets')) {
        setOpenSubmenu('Budgets');
      } else if (currentMenuItem.includes('Invitations')) {
        setOpenSubmenu('Invitations');
      } else if (currentMenuItem.includes('Meetings')) {
        setOpenSubmenu('Meetings');
      } else if (currentMenuItem.includes('SchoolProgress')) {
        setOpenSubmenu('School Progress');
      } else if (currentMenuItem.includes('Exams')) {
        setOpenSubmenu('Exams');
      }
    }
  }, [currentMenuItem]);

  const fetchUserDetails = async () => {
    try {
      const storedUsername = localStorage.getItem('districtUsername');
      
      if (storedUsername) {
        setDistrictName(storedUsername);
        return;
      }
      
      const token = localStorage.getItem('districtToken');
      if (!token) return;
      
      const response = await axios.get('http://localhost:3000/api/users/details', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data && response.data.data.username) {
        setDistrictName(response.data.data.username);
        localStorage.setItem('districtUsername', response.data.data.username);
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
        setDistrictName(payload.username);
        localStorage.setItem('districtUsername', payload.username);
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
    navigate('/login/district');
  };

  const handleDashboardClick = () => {
    onMenuItemClick('dashboard');
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <Box
      className="district-sidebar-wrapper"
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
              {districtName}
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

            <MenuItem 
              onClick={() => onMenuItemClick('profile')}
              active={currentMenuItem === 'profile'}
              icon={<User size={18} />}
            >
              Profile
            </MenuItem>

            <MenuItem 
              onClick={() => onMenuItemClick('schoolSearch')}
              active={currentMenuItem === 'schoolSearch'}
              icon={<Search size={18} />}
            >
              School Search
            </MenuItem>

            <MenuItem 
              onClick={() => onMenuItemClick('budgets')}
              active={currentMenuItem === 'budgets'}
              icon={<DollarSign size={18} />}
            >
              Budgets
            </MenuItem>

            <MenuItem 
              onClick={() => onMenuItemClick('invitations')}
              active={currentMenuItem === 'invitations'}
              icon={<FilePlus size={18} />}
            >
              Invitations
            </MenuItem>

            <MenuItem 
              onClick={() => onMenuItemClick('meetings')}
              active={currentMenuItem === 'meetings'}
              icon={<MessageSquare size={18} />}
            >
              Meetings
            </MenuItem>

            <MenuItem 
              onClick={() => onMenuItemClick('schoolProgress')}
              active={currentMenuItem === 'schoolProgress'}
              icon={<Activity size={18} />}
            >
              School Progress
            </MenuItem>

            <MenuItem 
              onClick={() => onMenuItemClick('exams')}
              active={currentMenuItem === 'exams'}
              icon={<FileText size={18} />}
            >
              Exams
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

export default DistrictSidebar;