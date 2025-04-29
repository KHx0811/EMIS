import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Avatar, Divider, Skeleton } from '@mui/material';
import { School, CalendarMonth, Person, Email, Badge } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

const PrincipalProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('principalToken');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await axios.get('http://localhost:3000/api/schools/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setProfileData(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch profile data');
        }
      } catch (err) {
        console.error('Error fetching principal profile:', err);
        setError(err.message || 'An error occurred while fetching your profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Typography variant="body1" color="#e0e0e0" sx={{ mt: 2 }}>
          Please try again later or contact system administrator.
        </Typography>
      </Box>
    );
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch (err) {
      return 'Date not available';
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ color: '#e0e0e0', mb: 3 }}>
        Principal Profile
      </Typography>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          borderRadius: 2, 
          backgroundColor: '#1F2A40',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                width: 150, 
                height: 150, 
                backgroundColor: '#00deb6',
                color: '#0f1322',
                fontSize: '3rem',
                mb: 2
              }}
            >
              {profileData?.principal_name?.charAt(0) || 'P'}
            </Avatar>
            <Typography variant="h5" sx={{ color: '#e0e0e0', mb: 1, textAlign: 'center' }}>
              {profileData?.principal_name || 'Principal Name Not Available'}
            </Typography>
            <Typography variant="body1" sx={{ color: '#a3a3a3', textAlign: 'center' }}>
              School Principal
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <Divider sx={{ mb: 3, borderColor: '#3d3d3d' }} />
              
              <ProfileItem 
                icon={<School sx={{ color: '#00deb6' }} />}
                label="School Name"
                value={profileData?.school_name || 'Not Available'}
              />
              
              <ProfileItem 
                icon={<Badge sx={{ color: '#00deb6' }} />}
                label="School ID"
                value={profileData?.school_id || 'Not Available'}
              />
              
              <ProfileItem 
                icon={<Badge sx={{ color: '#00deb6' }} />}
                label="District ID"
                value={profileData?.district_id || 'Not Available'}
              />
              
              <ProfileItem 
                icon={<CalendarMonth sx={{ color: '#00deb6' }} />}
                label="School Established"
                value={formatDate(profileData?.date_of_establishment) || 'Not Available'}
              />
              
              <ProfileItem 
                icon={<Email sx={{ color: '#00deb6' }} />}
                label="Email Address"
                value={profileData?.email || 'Not Available'}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

// Helper component for profile items
const ProfileItem = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
    {icon}
    <Box sx={{ ml: 2 }}>
      <Typography variant="body2" sx={{ color: '#a3a3a3' }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

// Loading skeleton
const ProfileSkeleton = () => (
  <Box>
    <Skeleton variant="text" width={200} height={40} sx={{ backgroundColor: '#1F2A40', mb: 3 }} />
    
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        borderRadius: 2, 
        backgroundColor: '#1F2A40',
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Skeleton variant="circular" width={150} height={150} sx={{ backgroundColor: '#2a3a5a', mb: 2 }} />
          <Skeleton variant="text" width={150} height={30} sx={{ backgroundColor: '#2a3a5a', mb: 1 }} />
          <Skeleton variant="text" width={100} height={20} sx={{ backgroundColor: '#2a3a5a' }} />
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 3 }}>
            <Divider sx={{ mb: 3, borderColor: '#3d3d3d' }} />
            {[1, 2, 3, 4, 5].map((item) => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={24} height={24} sx={{ backgroundColor: '#2a3a5a' }} />
                <Box sx={{ ml: 2, width: '100%' }}>
                  <Skeleton variant="text" width={100} height={20} sx={{ backgroundColor: '#2a3a5a' }} />
                  <Skeleton variant="text" width="80%" height={24} sx={{ backgroundColor: '#2a3a5a' }} />
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  </Box>
);

export default PrincipalProfile;