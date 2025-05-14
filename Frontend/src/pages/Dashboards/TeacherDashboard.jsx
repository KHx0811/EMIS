import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import TeacherSidebar from '../../Components/Sidebars/TeacherSidebar';
import SessionTimer from '../../Components/SessionTimer';

import Attendance from '@/forms/Teacher/Attendance';
import Assignments from '@/forms/Teacher/Assignments';
import Events from '@/forms/Teacher/Events';
import ParentInteraction from '@/forms/Teacher/ParentInteraction';
import Leave from '@/forms/Teacher/Leave';
import Marks from '@/forms/Teacher/Marks';
import ContactAdmin from '@/forms/Teacher/ContactAdmin';
import SearchStudent from '@/forms/Teacher/searchstudent';
import Classes from '@/forms/Teacher/Classes';
import config from '@/assets/config';

const { url } = config;

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getSelectedMenuItem = () => {
    const pathSegments = location.pathname.split('/');
    return pathSegments.length > 3 ? pathSegments[3] : 'dashboard';
  };

  const [selectedMenuItem, setSelectedMenuItem] = useState(getSelectedMenuItem());

  const getToken = () => {
    const token = localStorage.getItem('teacherToken');
    if (!token) {
      navigate('/login/teacher');
      return null;
    }
    return token;
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem('teacherToken');
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
        localStorage.removeItem('teacherToken');
        localStorage.removeItem('teacherUsername');
        navigate('/login/teacher');
      }
    } catch (e) {
      console.error('Error decoding token:', e);
    }
  };

  useEffect(() => {
    checkTokenExpiration();
    const token = localStorage.getItem('teacherToken');
    if (!token) {
      navigate('/login/teacher');
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
        localStorage.removeItem('teacherToken');
        localStorage.removeItem('teacherUsername');
        localStorage.removeItem('userType');
        navigate('/login/teacher');
      }
    };
    
    verifyToken();
    
    setSelectedMenuItem(getSelectedMenuItem());
  }, [location.pathname]);

  const handleMenuItemClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
    navigate(`/dashboard/teacher/${menuItem}`);
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
    }
  };

  const renderContent = () => {
    switch (selectedMenuItem) {
      case 'classes':
        return (
          <Box sx={globalStyles}><Classes /></Box>
        );
      case 'search student':
      return (
        <Box sx={globalStyles}><SearchStudent /></Box>
      );
      case 'attendance':
        return (
          <Box sx={globalStyles}><Attendance /></Box>
        );
      case 'marks':
        return (
          <Box sx={globalStyles}><Marks /></Box>
        );
      case 'assignments':
        return (
          <Box sx={globalStyles}><Assignments /></Box>
        );
      case 'events':
        return (
          <Box sx={globalStyles}><Events /></Box>
        );
      case 'parentInteraction':
        return (
          <Box sx={globalStyles}><ParentInteraction /></Box>
        );
      case 'leave':
        return (
          <Box sx={globalStyles}><Leave /></Box>
        );
      case 'Contact Admin':
        return (
          <Box sx={globalStyles}>
            <ContactAdmin />
          </Box>
        );
      default:
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              Welcome to the Teacher Dashboard
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      <TeacherSidebar 
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
            Teacher Dashboard
          </Typography>
          
          <SessionTimer tokenKey="teacherToken" />
        </Box>

        {renderContent()}
      </Box>
    </Box>
  );
};

export default TeacherDashboard;