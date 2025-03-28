import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, MenuItem, Select, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Attendance = ({ onSubmit = () => {} }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentId: '',
    date: '',
    status: '' // Present or Absent
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

      const response = await axios.post('http://localhost:3000/api/attendance', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Attendance submitted successfully:', response.data);
      alert('Attendance submitted successfully');
      onSubmit(response.data);
    } catch (error) {
      console.error('Error submitting attendance:', error);
      alert('Error submitting attendance. Please try again.');
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
        Attendance Form
      </Typography>

      <Box sx={{ marginBottom: '16px' }}>
        <label htmlFor="studentId" style={{ color: '#f1f5f9' }}>Student ID *</label>
        <input
          id="studentId"
          name="studentId"
          type="text"
          value={formData.studentId}
          onChange={handleChange}
          required
          style={{ backgroundColor: '#1F2A40', color: '#e0e0e0', width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #3d3d3d' }}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label htmlFor="date" style={{ color: '#f1f5f9' }}>Date *</label>
        <input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
          style={{ backgroundColor: '#1F2A40', color: '#e0e0e0', width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #3d3d3d' }}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label htmlFor="status" style={{ color: '#f1f5f9' }}>Status *</label>
        <Select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          sx={{ backgroundColor: '#1F2A40', color: '#e0e0e0', width: '100%' }}
          displayEmpty
        >
          <MenuItem value="" disabled>Select Status</MenuItem>
          <MenuItem value="Present">Present</MenuItem>
          <MenuItem value="Absent">Absent</MenuItem>
        </Select>
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
          Submit Attendance
        </Button>
      </Box>
    </Box>
  );
};

export default Attendance;