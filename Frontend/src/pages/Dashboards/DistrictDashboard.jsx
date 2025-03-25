import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import DistrictSidebar from '../../Components/Sidebars/DistrictSidebar';

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
    navigate(`/dashboard/district/${menuItem}`);
  };

  const renderContent = () => {
    switch (selectedMenuItem) {
      case 'profile':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              Profile
            </Typography>
            <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
              Details about the district head's profile.
            </Typography>
          </Box>
        );
      case 'schoolSearch':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              School Search
            </Typography>
            <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
              Details about school search.
            </Typography>
          </Box>
        );
      case 'budgets':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              Budgets
            </Typography>
            <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
              Details about budgets.
            </Typography>
          </Box>
        );
      case 'invitations':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              Invitations
            </Typography>
            <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
              Details about invitations.
            </Typography>
          </Box>
        );
      case 'meetings':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              Meetings
            </Typography>
            <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
              Details about meetings.
            </Typography>
          </Box>
        );
      case 'schoolProgress':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              School Progress
            </Typography>
            <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
              Details about school progress.
            </Typography>
          </Box>
        );
      case 'exams':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              Exams
            </Typography>
            <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
              Details about exams.
            </Typography>
          </Box>
        );
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
        </Box>

        {renderContent()}
      </Box>
    </Box>
  );
};

export default DistrictDashboard;