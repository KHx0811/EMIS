import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle } from '../../forms/Admin/Student/formStyles';

const Events = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    teacherId: '',
    eventName: '',
    eventType: '',
    description: '',
    date: ''
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

      const response = await axios.post('http://localhost:3000/api/teachers/add-event', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      alert('Event added successfully');
      setFormData({
        teacherId: '',
        eventName: '',
        eventType: '',
        description: '',
        date: ''
      });
    } catch (error) {
      alert('Error adding event. Please try again.');
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
        Add Event
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
        <label style={labelStyle} htmlFor="eventName">Event Name *</label>
        <input
          id="eventName"
          name="eventName"
          value={formData.eventName}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="eventType">Event Type *</label>
        <input
          id="eventType"
          name="eventType"
          value={formData.eventType}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="date">Date *</label>
        <input
          id="date"
          name="date"
          type="date"
          value={formData.date}
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
            },
          }}
        >
          Add Event
        </Button>
      </Box>
    </Box>
  );
};

export default Events;