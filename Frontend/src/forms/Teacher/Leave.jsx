import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle, formControlStyle, selectStyle } from '../../forms/Admin/Student/formStyles';

const Leave = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    teacherId: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('teacherToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/teacher');
        return;
      }

      const response = await axios.post('http://localhost:3000/api/teachers/apply-leave', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Leave application submitted successfully:', response.data);
      alert('Leave application submitted successfully');
    } catch (error) {
      console.error('Error submitting leave application:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('teacherToken');
          navigate('/login/teacher');
        } else {
          alert(`Error submitting leave application: ${error.response.data.message || 'Please try again.'}`);
        }
      } else {
        alert('Error submitting leave application. Please check your network connection.');
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
        Apply for Leave
      </Typography>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="teacherId">Teacher ID *</label>
        <input
          id="teacherId"
          name="teacherId"
          value={formData.teacherId}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="startDate">Start Date *</label>
        <input
          id="startDate"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="endDate">End Date *</label>
        <input
          id="endDate"
          name="endDate"
          type="date"
          value={formData.endDate}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="reason">Reason *</label>
        <textarea
          id="reason"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          required
          style={{...inputStyle, minHeight: '80px', resize: 'vertical'}}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
        <Button 
          type="submit" 
          variant="contained" 
          sx={{ 
            backgroundColor: '#3b82f6', // Button background color
            color: '#f1f5f9', // Button text color
            padding: '8px 16px',
            '&:hover': {
              backgroundColor: '#2563eb', // Button hover background color
            }
          }}
        >
          Submit Leave Application
        </Button>
      </Box>
    </Box>
  );
};

export default Leave;