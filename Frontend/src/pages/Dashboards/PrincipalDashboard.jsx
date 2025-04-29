import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import PrincipalSidebar from '../../Components/Sidebars/PrincipalSidebar';
import SessionTimer from '@/Components/SessionTimer';

import PrincipalProfile from '@/forms/Principal/Profile';
import StudentSearch from '@/forms/Principal/StudentSearch';
import TeacherSearch from '@/forms/Principal/TeacherSearch';
import SchoolFees from '@/forms/Principal/SchoolFees';
import BudgetUsage from '@/forms/Principal/BudgetAllocation';
import Events from '@/forms/Principal/Events';
import Meetings from '@/forms/Principal/Meetings';
import LeaveApprovals from '@/forms/Principal/LeaveApprovals';
import StudentProgress from '@/forms/Principal/StudentProgress';
import ContactAdmin from '@/forms/Principal/ContactAdmin';

const PrincipalDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getSelectedMenuItem = () => {
    const pathSegments = location.pathname.split('/');
    return pathSegments.length > 3 ? pathSegments[3] : 'dashboard';
  };

  const [selectedMenuItem, setSelectedMenuItem] = useState(getSelectedMenuItem());

  const handleMenuItemClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
    navigate(`/dashboard/principal/${menuItem}`);
  };

  const globalStyles = {
    '& .form-field': {
      marginBottom: '24px',
      position: 'relative',
    },
    '& input, & select, & textarea': {
      backgroundColor: '#1F2A40',
      color: '#e0e0e0',
      border: '1px solid #3d3d3d',
      padding: '12px 16px',
      borderRadius: '4px',
      width: '100%',
      fontSize: '0.9rem',
      height: '48px',
      '&:focus': {
        borderColor: '#00deb6',
        outline: 'none',
      },
      '&::placeholder': {
        color: '#a3a3a3',
      }
    },
    '& .MuiInputBase-root': {
      backgroundColor: '#1F2A40',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#3d3d3d',
    },
    '& .MuiInputBase-input': {
      color: '#e0e0e0',
    },
    '& .MuiInputLabel-root': {
      color: '#e0e0e0',
      '&.Mui-focused': {
        color: '#00deb6',
      }
    },
    '& .MuiFormLabel-root': {
      color: '#e0e0e0',
    },
    '& .MuiRadio-root': {
      color: '#a3a3a3',
      '&.Mui-checked': {
        color: '#00deb6',
      }
    },
    '& .MuiSelect-select': {
      backgroundColor: '#1F2A40',
      color: '#e0e0e0',
    },
    '& .MuiMenuItem-root': {
      backgroundColor: '#141b2d',
      color: '#e0e0e0',
      '&:hover': {
        backgroundColor: '#1F2A40',
      },
      '&.Mui-selected': {
        backgroundColor: 'rgba(0, 222, 182, 0.2)',
      }
    },
    '& .MuiFormControlLabel-label': {
      color: '#e0e0e0',
    },
    '& .MuiButton-contained': {
      backgroundColor: '#00deb6',
      color: '#0f1322',
      '&:hover': {
        backgroundColor: '#00b696',
      }
    }
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem('principalToken');
    if (!token) return;

    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error('Invalid token format');
      return;
    }

    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        console.error('Token has expired');
        localStorage.removeItem('principalToken');
        localStorage.removeItem('userType');
        navigate('/login/principal');
      }
    } catch (e) {
      console.error('Error decoding token:', e);
    }
  };

  useEffect(() => {
    checkTokenExpiration();
    const token = localStorage.getItem('principalToken');
    if (!token) {
      navigate('/login/principal');
      return;
    }

    const verifyToken = async () => {
      try {
        await axios.get('http://localhost:3000/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('principalToken');
        navigate('/login/principal');
      }
    };

    verifyToken();
    setSelectedMenuItem(getSelectedMenuItem());
  }, [location.pathname]);

  const renderContent = () => {
    switch (selectedMenuItem) {
      case 'profile':
        return <Box sx={globalStyles}><PrincipalProfile /></Box>;
      case 'studentSearch':
        return <Box sx={globalStyles}><StudentSearch /></Box>;
      case 'teacherSearch':
        return <Box sx={globalStyles}><TeacherSearch /></Box>;
      case 'schoolFees':
        return <Box sx={globalStyles}><SchoolFees /></Box>;
      case 'budgetUsage':
        return <Box sx={globalStyles}><BudgetUsage /></Box>;
      case 'events':
        return <Box sx={globalStyles}><Events /></Box>;
      case 'meetings':
        return <Box sx={globalStyles}><Meetings /></Box>;
      case 'leaveApprovals':
        return <Box sx={globalStyles}><LeaveApprovals /></Box>;
      case 'studentProgress':
        return <Box sx={globalStyles}><StudentProgress /></Box>;
      case 'contactAdmin':
        return <Box sx={globalStyles}><ContactAdmin /></Box>
      default:
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              Welcome to the Principal Dashboard
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      <PrincipalSidebar
        onMenuItemClick={handleMenuItemClick}
        currentMenuItem={selectedMenuItem}
      />
      <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#141b2d', overflow: 'auto' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            backgroundColor: '#1F2A40',
            borderRadius: '8px',
            mb: 3,
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Typography variant="h4" sx={{ color: '#e0e0e0' }}>
            Principal Dashboard
          </Typography>
          <SessionTimer tokenKey="principalToken" />
        </Box>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default PrincipalDashboard;