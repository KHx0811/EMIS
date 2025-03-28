import React, { useState } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle } from '../Student/formStyles';

const CreateSchool = ({ onSubmit = () => {} }) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [generatedSchoolId, setGeneratedSchoolId] = useState(''); // State to store the generated school ID

  const [formData, setFormData] = useState({
    school_name: '',
    district_id: '',
    principal_name: '',
    date_of_establishment: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === 'district_id') {
      setError('');
    }
  };

  const handleClear = () => {
    setFormData({
      school_name: '',
      district_id: '',
      principal_name: '',
      date_of_establishment: '',
      email: '',
      password: '',
    });
    setError('');
    setGeneratedSchoolId(''); // Clear the generated school ID message
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

      const formattedData = {
        ...formData,
        date_of_establishment: new Date(formData.date_of_establishment).toISOString(),
      };

      const response = await axios.post('http://localhost:3000/api/schools', formattedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const createdSchool = response.data.data;
      console.log('School created successfully:', createdSchool);
      setGeneratedSchoolId(createdSchool.school_id); // Store the generated school ID
      alert('School created successfully');
      onSubmit(createdSchool);
    } catch (error) {
      console.error('Error creating school:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('adminToken');
          navigate('/login/admin');
        } else if (error.response.status === 404 && error.response.data.code === 'DISTRICT_NOT_FOUND') {
          setError('The District ID does not exist. Please verify or create it first.');
        } else {
          alert(`Error creating school: ${error.response.data.message || 'Please try again.'}`);
        }
      } else {
        alert('Error creating school. Please check your network connection.');
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
        Create School Form
      </Typography>

      {error && (
        <Alert
          severity="warning"
          sx={{ mb: 2, backgroundColor: '#422006', color: '#fef3c7', borderColor: '#d97706' }}
        >
          {error}
        </Alert>
      )}

      {generatedSchoolId && (
        <Typography
          variant="h6"
          sx={{
            color: '#22c55e',
            marginBottom: '16px',
          }}
        >
          School created successfully! Generated School ID: {generatedSchoolId}
        </Typography>
      )}

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="school_name">School Name *</label>
        <input
          id="school_name"
          name="school_name"
          value={formData.school_name}
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
          value={formData.district_id}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="principal_name">Principal Name *</label>
        <input
          id="principal_name"
          name="principal_name"
          value={formData.principal_name}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="date_of_establishment">Date of Establishment *</label>
        <input
          id="date_of_establishment"
          name="date_of_establishment"
          type="date"
          value={formData.date_of_establishment}
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
          Create School Profile
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

export default CreateSchool;