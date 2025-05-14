import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Typography, Grid, Card, CardContent } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ParentSidebar from '../../Components/Sidebars/ParentSidebar';
import { BookOpen, Bell, Calendar, CreditCard } from 'lucide-react';
import ChildProfile from '@/forms/Parent/ChildProfile';
import Attendance from '@/forms/Parent/Attendance';
import Marks from '@/forms/Parent/Marks';
import Teachers from '@/forms/Parent/Teachers';
import Feedues from '@/forms/Parent/Feedues';
import SchoolEvents from '@/forms/Parent/SchoolEvents';
import PTMeetings from '@/forms/Parent/PTMeetings';
import SessionTimer from '@/Components/SessionTimer';
import ParentProfile from '@/forms/Parent/Profile';
import ContactAdmin from '@/forms/Parent/ContactAdmin';
import config from '@/assets/config';

const { url } = config;

const ParentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getSelectedMenuItem = () => {
    const pathSegments = location.pathname.split('/');
    return pathSegments.length > 3 ? pathSegments[3] : 'dashboard';
  };

  const [selectedMenuItem, setSelectedMenuItem] = useState(getSelectedMenuItem());

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

  const getToken = () => {
    const token = localStorage.getItem('parentToken');
    if (!token) {
      navigate('/login/parent');
      return null;
    }
    return token;
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem('parentToken');
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
        console.error('Token has expired at:', new Date(payload.exp * 1000));
        console.log('Current time:', new Date(currentTime * 1000));
        localStorage.removeItem('parentToken');
        localStorage.removeItem('parentUsername');
        localStorage.removeItem('userType');
        navigate('/login/parent');
      }
    } catch (e) {
      console.error('Error decoding token:', e);
    }
  };

  useEffect(() => {
    checkTokenExpiration();
    const token = localStorage.getItem('parentToken');
    if (!token) {
      navigate('/login/parent');
      return;
    }

    const verifyToken = async () => {
      try {
        await axios.get(`${url}/api/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Token verified successfully');
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('parentToken');
        localStorage.removeItem('parentUsername');
        navigate('/login/parent');
      }
    };

    verifyToken();

    setSelectedMenuItem(getSelectedMenuItem());
  }, [location.pathname]);

  const handleMenuItemClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
    navigate(`/dashboard/parent/${menuItem}`);
  };


  const renderContent = () => {
    switch (selectedMenuItem) {
      case 'profile':
        return (<Box sx={globalStyles}><ParentProfile /></Box>);
      case 'childProfile':
        return (<Box sx={globalStyles}><ChildProfile /></Box>);
      case 'Attendance':
        return <Box sx={globalStyles}><Attendance /></Box>;
      case 'Marks':
        return <Box sx={globalStyles}><Marks /></Box>;
      case 'Teachers':
        return <Box sx={globalStyles}><Teachers /></Box>;
      case 'Fees':
        return <Box sx={globalStyles}><Feedues /></Box>;
      case 'Events':
        return <Box sx={globalStyles}><SchoolEvents /></Box>;
      case 'PT Meetings':
        return <Box sx={globalStyles}><PTMeetings /></Box>;
      case 'ContactAdmin':
        return <Box sx={globalStyles}><ContactAdmin /></Box>
      default:
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              Welcome to the Parent Dashboard
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      <ParentSidebar
        onMenuItemClick={handleMenuItemClick}
        currentMenuItem={selectedMenuItem}
      />

      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#141b2d',
          overflow: 'auto',
        }}
      >
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
            Parent Dashboard
          </Typography>
          <SessionTimer tokenKey="parentToken" />
        </Box>

        {renderContent()}
      </Box>
    </Box>
  );
};

export default ParentDashboard;