import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle, formControlStyle, selectStyle } from '../../forms/Admin/Student/formStyles';

const Marks = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    value: '',
    maxMarks: '',
    type: ''
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

      const response = await axios.post('http://localhost:3000/api/students/upload-marks', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Marks uploaded successfully:', response.data);
      alert('Marks uploaded successfully');
    } catch (error) {
      console.error('Error uploading marks:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('teacherToken');
          navigate('/login/teacher');
        } else {
          alert(`Error uploading marks: ${error.response.data.message || 'Please try again.'}`);
        }
      } else {
        alert('Error uploading marks. Please check your network connection.');
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
        Upload Marks
      </Typography>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="studentId">Student ID *</label>
        <input
          id="studentId"
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="subject">Subject *</label>
        <input
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="value">Marks Obtained *</label>
        <input
          id="value"
          name="value"
          type="number"
          value={formData.value}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="maxMarks">Maximum Marks *</label>
        <input
          id="maxMarks"
          name="maxMarks"
          type="number"
          value={formData.maxMarks}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="type">Exam Type *</label>
        <input
          id="type"
          name="type"
          value={formData.type}
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
            backgroundColor: '#3b82f6', // Button background color
            color: '#f1f5f9', // Button text color
            padding: '8px 16px',
            '&:hover': {
              backgroundColor: '#2563eb', // Button hover background color
            }
          }}
        >
          Upload Marks
        </Button>
      </Box>
    </Box>
  );
};

export default Marks;