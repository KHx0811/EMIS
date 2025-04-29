import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle } from '../Student/formStyles';

const CreateDistrict = ({ onSubmit = () => {} }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    district_name: '',
    districthead_name: '',
    state: '',
    email: '',
    password: '',
  });

  const [generatedDistrictId, setGeneratedDistrictId] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleClear = () => {
    setFormData({
      district_name: '',
      districthead_name: '',
      state: '',
      email: '',
      password: '',
    });
    setGeneratedDistrictId(''); // Clear the generated district ID message
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return;
      }

      const response = await axios.post('http://localhost:3000/api/districts', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const createdDistrict = response.data.data;
      console.log('District created successfully:', createdDistrict);
      setGeneratedDistrictId(createdDistrict.district_id); // Store the generated district ID
      alert('District created successfully');
      onSubmit(createdDistrict);
    } catch (error) {
      console.error('Error creating district:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('adminToken');
          navigate('/login/admin');
        } else {
          alert(`Error creating district: ${error.response.data.message || 'Please try again.'}`);
        }
      } else {
        alert('Error creating district. Please check your network connection.');
      }
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0f172a',
        padding: '24px',
        borderRadius: '8px',
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
          paddingBottom: '16px',
        }}
      >
        Create District Form
      </Typography>

      {generatedDistrictId && (
        <Typography
          variant="h6"
          sx={{
            color: '#22c55e',
            marginBottom: '16px',
          }}
        >
          District created successfully! Generated District ID: {generatedDistrictId}
        </Typography>
      )}

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="district_name">District Name *</label>
        <input
          id="district_name"
          name="district_name"
          value={formData.district_name}
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
          value={formData.state}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="district_name">DistrictHead Name *</label>
        <input
          id="districthead_name"
          name="districthead_name"
          value={formData.districthead_name}
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
          value={formData.email}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="password">Password *</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
        <Button
          type="submit"
          variant="contained"
          sx={{
            backgroundColor: '#3b82f6',
            color: '#f1f5f9',
            padding: '8px 16px',
            '&:hover': {
              backgroundColor: '#2563eb',
            },
          }}
        >
          Create District Profile
        </Button>

        <Button
          type="button"
          variant="outlined"
          onClick={handleClear}
          sx={{
            borderColor: '#f87171',
            color: '#f87171',
            padding: '8px 16px',
            '&:hover': {
              borderColor: '#ef4444',
              color: '#ef4444',
            },
          }}
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
};

export default CreateDistrict;