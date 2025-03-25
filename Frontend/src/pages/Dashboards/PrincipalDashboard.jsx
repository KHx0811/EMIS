import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import PrincipalSidebar from '../../Components/Sidebars/PrincipalSidebar';

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

  const renderContent = () => {
    switch (selectedMenuItem) {
      case 'profile':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              Profile
            </Typography>
            <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
              Details about the principal's profile.
            </Typography>
          </Box>
        );
      case 'studentSearch':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              Student Search
            </Typography>
            <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
              Details about student search.
            </Typography>
          </Box>
        );
      case 'teacherSearch':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              Teacher Search
            </Typography>
            <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
              Details about teacher search.
            </Typography>
          </Box>
        );
      case 'schoolFees':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              School Fees
            </Typography>
            <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
              Details about school fees.
            </Typography>
          </Box>
        );
      case 'budgetAllocation':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              Budget Allocation
            </Typography>
            <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
              Details about budget allocation.
            </Typography>
          </Box>
        );
      case 'events':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              Events
            </Typography>
            <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
              Details about events.
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
      case 'leaveApprovals':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              Leave Approvals
            </Typography>
            <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
              Details about leave approvals.
            </Typography>
          </Box>
        );
      case 'studentProgress':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              Student Progress
            </Typography>
            <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
              Details about student progress.
            </Typography>
          </Box>
        );
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
            Principal Dashboard
          </Typography>
        </Box>

        {renderContent()}
      </Box>
    </Box>
  );
};

export default PrincipalDashboard;