import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Typography, Grid, Card, CardContent } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ParentSidebar from '../../Components/Sidebars/ParentSidebar';
import { BookOpen, Bell, Calendar, CreditCard } from 'lucide-react';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getSelectedMenuItem = () => {
    const pathSegments = location.pathname.split('/');
    return pathSegments.length > 3 ? pathSegments[3] : 'dashboard';
  };

  const [selectedMenuItem, setSelectedMenuItem] = useState(getSelectedMenuItem());
  const [notifications, setNotifications] = useState([]);
  const [children, setChildren] = useState([
    { _id: '1', name: 'John Doe' },
    { _id: '2', name: 'Jane Doe' }
  ]);

  const handleMenuItemClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
    navigate(`/dashboard/parent/${menuItem}`);
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('parentToken');
      const response = await axios.get('http://localhost:3000/api/parents/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const renderContent = () => {
    switch (selectedMenuItem) {
      case 'dashboard':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              Welcome to the Parent Dashboard
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: '#1F2A40', color: '#e0e0e0' }}>
                  <CardContent>
                    <Typography variant="h5">Child 1</Typography>
                    <Typography variant="body2">Details about Child 1</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: '#1F2A40', color: '#e0e0e0' }}>
                  <CardContent>
                    <Typography variant="h5">Child 2</Typography>
                    <Typography variant="body2">Details about Child 2</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      case 'fees':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              Fee Management
            </Typography>
            <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
              Details about fee management.
            </Typography>
          </Box>
        );
      case 'meetings':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              Parent-Teacher Meetings
            </Typography>
            <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
              Details about parent-teacher meetings.
            </Typography>
          </Box>
        );
      case 'notifications':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
              Notifications
            </Typography>
            {notifications.map((notification, index) => (
              <Card key={index} sx={{ backgroundColor: '#1F2A40', color: '#e0e0e0', mb: 2 }}>
                <CardContent>
                  <Typography variant="body1">{notification.message}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        );
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
        children={children}
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
        </Box>

        {renderContent()}
      </Box>
    </Box>
  );
};

export default ParentDashboard;