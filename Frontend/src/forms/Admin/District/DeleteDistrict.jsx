import React, { useState } from 'react';
import { Box, TextField, IconButton, Button, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle } from '../Student/formStyles';

const url = import.meta.env.URL;

const DeleteDistrict = () => {
  const navigate = useNavigate();
  const [districtId, setDistrictId] = useState('');
  const [districtData, setDistrictData] = useState(null);

  const fetchDistrictById = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return null;
      }
      const response = await axios.get(`${url}/api/districts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching district data:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('adminToken');
        navigate('/login/admin');
      } else {
        alert('Error fetching district data. Please try again.');
      }
      return null;
    }
  };

  const deleteDistrict = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return;
      }
      await axios.delete(`${url}/api/districts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('District deleted successfully');
      alert('District deleted successfully');
      setDistrictData(null);
    } catch (error) {
      console.error('Error deleting district:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('adminToken');
        navigate('/login/admin');
      } else {
        alert('Error deleting district. Please try again.');
      }
    }
  };

  const handleSearch = async () => {
    const data = await fetchDistrictById(districtId);
    if (data) {
      setDistrictData(data);
    } else {
      setDistrictData(null);
    }
  };

  const handleDelete = () => {
    deleteDistrict(districtId);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#0f172a',
        padding: '24px',
        borderRadius: '8px'
      }}
    >
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom
        sx={{ 
          color: '#f1f5f9',
          marginBottom: '24px',
          borderBottom: '1px solid #475569',
          paddingBottom: '16px'
        }}
      >
        Delete District Profile
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          label="District ID"
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          onKeyPress={handleKeyPress}
          required
          halfWidth
          size='Small'
          variant='filled'
          sx={{textDecoration: 'none', borderColor: 'none'}}
        />
        <IconButton 
          onClick={handleSearch}
          sx={{ 
            color: '#f1f5f9',
            backgroundColor: '#3b82f6',
            borderRadius: '50px',
            padding: '12px',
            marginLeft: '8px',
            '&:hover': {
              backgroundColor: '#2563eb',
            }
          }}
        >
          <SearchIcon />
        </IconButton>
      </Box>

      {districtData && (
        <Box sx={{ mt: 2, height:'100vh', color: '#f1f5f9' }}>
          <Typography variant="h6">District Details</Typography>
          <Typography>District ID: {districtData.district_id}</Typography>
          <Typography>District Name: {districtData.district_name}</Typography>
          <Typography>DistrictHead Name: {districtData.districthead_name}</Typography>
          <Typography>State: {districtData.state}</Typography>
          <Typography>Email: {districtData.email}</Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleDelete}
            sx={{ 
              backgroundColor: '#3b82f6',
              color: '#f1f5f9',
              padding: '8px 16px',
              marginTop: '16px',
              '&:hover': {
                backgroundColor: '#2563eb',
              }
            }}
          >
            Delete District
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DeleteDistrict;