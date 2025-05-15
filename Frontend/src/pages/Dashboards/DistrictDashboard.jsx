import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import DistrictSidebar from '../../Components/Sidebars/DistrictSidebar';

import DistrictProfile from '@/forms/District/DistrictProfile';
import SchoolSearch from '@/forms/District/SchoolSearch';
import Budgets from '@/forms/District/Budgets';
import Invitations from '@/forms/District/ContactAdmin';
import Meetings from '@/forms/District/Meetings';
import Exams from '@/forms/District/Exams';
import SessionTimer from '@/Components/SessionTimer';
import TeacherSearch from '@/forms/District/TeacherSearch';
import StudentSearch from '@/forms/District/StudentSearch';
import ContactAdmin from '@/forms/District/ContactAdmin';

const url = import.meta.env.URL;

const DistrictDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getSelectedMenuItem = () => {
    const pathSegments = location.pathname.split('/');
    return pathSegments.length > 3 ? pathSegments[3] : 'dashboard';
  };

  const [selectedMenuItem, setSelectedMenuItem] = useState(getSelectedMenuItem());

  const handleMenuItemClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
    navigate(`/dashboard/districthead/${menuItem}`);
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

  const getToken = () => {
    const token = localStorage.getItem('districtToken');
    if (!token) {
      navigate('/login/district');
      return null;
    }
    return token;
  };


  const checkTokenExpiration = () => {
    const token = localStorage.getItem('districtToken');
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
        localStorage.removeItem('districtToken');
        navigate('/login/districthead');
      }
    } catch (e) {
      console.error('Error decoding token:', e);
    }
  };

  useEffect(() => {
    checkTokenExpiration();
    const token = localStorage.getItem('districtToken');
    if (!token) {
      navigate('/login/districthead');
      return;
    }

    const verifyToken = async () => {
      try {
        await axios.get(`${url}0/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('districtToken');
        localStorage.removeItem('userType');
        navigate('/login/districthead');
      }
    };

    verifyToken();
    setSelectedMenuItem(getSelectedMenuItem());
  }, [location.pathname]);


  const renderContent = () => {
    switch (selectedMenuItem) {
      case 'profile':
        return <Box sx={globalStyles}><DistrictProfile /></Box>
      case 'schoolSearch':
        return <Box sx={globalStyles}><SchoolSearch /></Box>
      case 'teacherSearch':
        return <Box sx={globalStyles}><TeacherSearch /></Box>
      case 'studentSearch':
        return <Box sx={globalStyles}><StudentSearch /></Box>
      case 'budgets':
        return <Box sx={globalStyles}><Budgets /></Box>
      case 'meetings':
        return <Box sx={globalStyles}><Meetings /></Box>
      case 'exams':
        return <Box sx={globalStyles}><Exams /></Box>
      case 'contactAdmin':
        return <Box sx={globalStyles}><ContactAdmin /></Box>
      default:
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              Welcome to the District Dashboard
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      <DistrictSidebar
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
            District Dashboard
          </Typography>
          <SessionTimer tokenKey="districtToken" />
        </Box>

        {renderContent()}
      </Box>
    </Box>
  );
};

export default DistrictDashboard;