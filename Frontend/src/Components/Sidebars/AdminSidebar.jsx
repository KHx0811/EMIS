import React, { useState, useEffect } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { LogOut } from 'lucide-react';
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = ({ onMenuItemClick, currentMenuItem }) => {
  const navigate = useNavigate();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    if (currentMenuItem) {
      if (currentMenuItem.includes('Student')) {
        setOpenSubmenu('Students');
      } else if (currentMenuItem.includes('Parent')) {
        setOpenSubmenu('Parents');
      } else if (currentMenuItem.includes('Teacher')) {
        setOpenSubmenu('Teachers');
      } else if (currentMenuItem.includes('School')) {
        setOpenSubmenu('Schools');
      } else if (currentMenuItem.includes('District')) {
        setOpenSubmenu('Districts');
      }
    }
  }, [currentMenuItem]);

  const fetchUserDetails = async () => {
    try {
      const storedUsername = localStorage.getItem('adminUsername');
      
      if (storedUsername) {
        setAdminName(storedUsername);
        return;
      }
      
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      
      const response = await axios.get('http://localhost:3000/api/users/details', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data && response.data.data.username) {
        setAdminName(response.data.data.username);
        localStorage.setItem('adminUsername', response.data.data.username);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      tryExtractUsernameFromToken();
    }
  };

  const tryExtractUsernameFromToken = () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return;
      
      const payload = JSON.parse(atob(tokenParts[1]));
      if (payload.username) {
        setAdminName(payload.username);
        localStorage.setItem('adminUsername', payload.username);
      }
    } catch (e) {
      console.error('Error extracting username from token:', e);
    }
  };

  const handleSubmenuClick = (label) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    navigate('/login/admin');
  };

  const handleDashboardClick = () => {
    onMenuItemClick('dashboard');
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <Box
      className="admin-sidebar-wrapper"
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
              {adminName}
            </Typography>
            <Typography variant="body2" sx={{ color: '#00deb6', margin: '2px 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
              Admin
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
              icon={<span style={{ fontSize: '1.2rem', marginRight: '8px' }}>📊</span>}
            >
              Dashboard
            </MenuItem>

            <SubMenu
              label="Students"
              icon={<span style={{ fontSize: '1.2rem', marginRight: '8px' }}>👨‍🎓</span>}
              open={openSubmenu === "Students"}
              onClick={() => handleSubmenuClick("Students")}
            >
              <MenuItem 
                onClick={() => onMenuItemClick('createStudent')}
                active={currentMenuItem === 'createStudent'}
              >
                Create Student
              </MenuItem>
              <MenuItem 
                onClick={() => onMenuItemClick('studentList')}
                active={currentMenuItem === 'studentList'}
              >
                Student List
              </MenuItem>
              <MenuItem 
                onClick={() => onMenuItemClick('updateStudent')}
                active={currentMenuItem === 'updateStudent'}
              >
                Update Student
              </MenuItem>
              <MenuItem 
                onClick={() => onMenuItemClick('deleteStudent')}
                active={currentMenuItem === 'deleteStudent'}
              >
                Delete Student
              </MenuItem>
            </SubMenu>

            <SubMenu
              label="Parents"
              icon={<span style={{ fontSize: '1.2rem', marginRight: '8px' }}>👪</span>}
              open={openSubmenu === "Parents"}
              onClick={() => handleSubmenuClick("Parents")}
            >
              <MenuItem 
                onClick={() => onMenuItemClick('createParent')}
                active={currentMenuItem === 'createParent'}
              >
                Create Parent
              </MenuItem>
              <MenuItem 
                onClick={() => onMenuItemClick('parentList')}
                active={currentMenuItem === 'parentList'}
              >
                Parent List
              </MenuItem>
              <MenuItem 
                onClick={() => onMenuItemClick('updateParent')}
                active={currentMenuItem === 'updateParent'}
              >
                Update Parent
              </MenuItem>
              <MenuItem 
                onClick={() => onMenuItemClick('deleteParent')}
                active={currentMenuItem === 'deleteParent'}
              >
                Delete Parent
              </MenuItem>
            </SubMenu>

            <SubMenu
              label="Teachers"
              icon={<span style={{ fontSize: '1.2rem', marginRight: '8px' }}>👩‍🏫</span>}
              open={openSubmenu === "Teachers"}
              onClick={() => handleSubmenuClick("Teachers")}
            >
              <MenuItem 
                onClick={() => onMenuItemClick('createTeacher')}
                active={currentMenuItem === 'createTeacher'}
              >
                Create Teacher
              </MenuItem>
              <MenuItem 
                onClick={() => onMenuItemClick('teacherList')}
                active={currentMenuItem === 'teacherList'}
              >
                Teacher List
              </MenuItem>
              <MenuItem 
                onClick={() => onMenuItemClick('updateTeacher')}
                active={currentMenuItem === 'updateTeacher'}
              >
                Update Teacher
              </MenuItem>
              <MenuItem 
                onClick={() => onMenuItemClick('deleteTeacher')}
                active={currentMenuItem === 'deleteTeacher'}
              >
                Delete Teacher
              </MenuItem>
            </SubMenu>

            <SubMenu
              label="Schools"
              icon={<span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🏫</span>}
              open={openSubmenu === "Schools"}
              onClick={() => handleSubmenuClick("Schools")}
            >
              <MenuItem 
                onClick={() => onMenuItemClick('createSchool')}
                active={currentMenuItem === 'createSchool'}
              >
                Create School
              </MenuItem>
              <MenuItem 
                onClick={() => onMenuItemClick('schoolList')}
                active={currentMenuItem === 'schoolList'}
              >
                School List
              </MenuItem>
              <MenuItem 
                onClick={() => onMenuItemClick('updateSchool')}
                active={currentMenuItem === 'updateSchool'}
              >
                Update School
              </MenuItem>
              <MenuItem 
                onClick={() => onMenuItemClick('deleteSchool')}
                active={currentMenuItem === 'deleteSchool'}
              >
                Delete School
              </MenuItem>
            </SubMenu>

            <SubMenu
              label="Districts"
              icon={<span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🏢</span>}
              open={openSubmenu === "Districts"}
              onClick={() => handleSubmenuClick("Districts")}
            >
              <MenuItem 
                onClick={() => onMenuItemClick('createDistrict')}
                active={currentMenuItem === 'createDistrict'}
              >
                Create District
              </MenuItem>
              <MenuItem 
                onClick={() => onMenuItemClick('districtList')}
                active={currentMenuItem === 'districtList'}
              >
                District List
              </MenuItem>
              <MenuItem 
                onClick={() => onMenuItemClick('updateDistrict')}
                active={currentMenuItem === 'updateDistrict'}
              >
                Update District
              </MenuItem>
              <MenuItem 
                onClick={() => onMenuItemClick('deleteDistrict')}
                active={currentMenuItem === 'deleteDistrict'}
              >
                Delete District
              </MenuItem>
            </SubMenu>
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

export default AdminSidebar;