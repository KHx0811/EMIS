import React, { useState } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle } from '../Student/formStyles';

const UpdateDistrict = () => {
  const navigate = useNavigate();
  const [districtId, setDistrictId] = useState('');
  const [districtData, setDistrictData] = useState(null);
  const [formData, setFormData] = useState({
    district_name: '',
    state: '',
    email: '',
    district_id: '',
  });
  const [error, setError] = useState('');

  const fetchDistrictById = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return null;
      }
      
      const response = await axios.get(`http://localhost:3000/api/districts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        setError('No data found for this district ID');
        return null;
      }
    } catch (error) {
      console.error('Error fetching district data:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('adminToken');
          navigate('/login/admin');
        } else {
          setError(`Error: ${error.response.data?.message || 'Failed to fetch district data'}`);
        }
      } else if (error.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      return null;
    }
  };

  const handleSearch = async () => {
    if (!districtId.trim()) {
      setError('Please enter a District ID');
      return;
    }
    
    setError('');
    try {
      const data = await fetchDistrictById(districtId);
      if (data) {
        setDistrictData(data);
        setFormData({
          ...data
        });
      }
    } catch (error) {
      console.error('Error in handleSearch:', error);
      setError('An error occurred while searching for the district. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return;
      }

      const response = await axios.put(`http://localhost:3000/api/districts/${districtId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('District updated successfully:', response.data);
      alert('District updated successfully');
    } catch (error) {
      console.error('Error updating district:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('adminToken');
          navigate('/login/admin');
        } else {
          setError(`Error: ${error.response.data?.message || 'Failed to update district'}`);
        }
      } else if (error.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <Box 
      sx={{ 
        backgroundColor: '#111827',
        padding: '24px',
        borderRadius: '8px',
        maxWidth: '100%'
      }}
    >
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom
        sx={{ 
          color: '#f1f5f9',
          marginBottom: '24px',
          borderBottom: '1px solid #1e293b',
          paddingBottom: '16px',
        }}
      >
        Update District Profile
      </Typography>

      <Box sx={{ marginBottom: '24px' }}>
        <label style={labelStyle} htmlFor="district_id_search">District ID *</label>
        <Box sx={{ display: 'flex', gap: '10px' }}>
          <input
            id="district_id_search"
            value={districtId}
            onChange={(e) => setDistrictId(e.target.value)}
            onKeyPress={handleKeyPress}
            required
            style={{
              ...inputStyle,
              marginBottom: 0,
              flexGrow: 1
            }}
            placeholder="Enter District ID"
          />
          <IconButton 
            onClick={handleSearch}
            sx={{ 
              color: '#f1f5f9',
              backgroundColor: '#3b82f6',
              borderRadius: '6px',
              padding: '8px',
              '&:hover': {
                backgroundColor: '#2563eb',
              }
            }}
          >
            <SearchIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Box sx={{ 
          backgroundColor: '#b91c1c20', 
          color: '#ef4444', 
          padding: '12px', 
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          {error}
        </Box>
      )}

      {districtData && (
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: '#0f172a',
            padding: '24px',
            borderRadius: '8px'
          }}
        >
          <Box sx={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="district_name">District Name *</label>
            <input
              id="district_name"
              name="district_name"
              value={formData.district_name || ''}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </Box>

          <Box sx={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="district_id">District ID *</label>
            <input
              id="district_id"
              name="district_id"
              value={formData.district_id || ''}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </Box>

          <Box sx={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="state">State *</label>
            <input
              id="state"
              name="state"
              value={formData.state || ''}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </Box>

          <Box sx={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="email">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <Button 
              type="submit" 
              variant="contained" 
              sx={{ 
                backgroundColor: '#3b82f6',
                color: '#f1f5f9',
                padding: '8px 16px',
                '&:hover': {
                  backgroundColor: '#2563eb',
                }
              }}
            >
              Update District Profile
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UpdateDistrict;