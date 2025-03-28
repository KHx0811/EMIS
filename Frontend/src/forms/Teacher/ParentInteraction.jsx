import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import { inputStyle, labelStyle, formControlStyle, selectStyle } from '../Admin/Student/formStyles';

const ParentInteraction = () => {
  const [formData, setFormData] = useState({
    teacherId: '',
    studentId: '',
    type: '',
    content: ''
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
      const response = await axios.post('http://localhost:3000/api/teacher/record-parent-interaction', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      alert('Parent interaction recorded successfully');
    } catch (error) {
      alert('Error recording parent interaction. Please try again.');
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
        Record Parent Interaction
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

      <FormControl component="fieldset" sx={formControlStyle}>
        <InputLabel id="type-label" style={labelStyle}>Interaction Type *</InputLabel>
        <Select
          labelId="type-label"
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          sx={selectStyle}
        >
          <MenuItem value="Email">Email</MenuItem>
          <MenuItem value="Phone">Phone</MenuItem>
          <MenuItem value="Meeting">Meeting</MenuItem>
          <MenuItem value="Message">Message</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="content">Content *</label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
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
          Record Interaction
        </Button>
      </Box>
    </Box>
  );
};

export default ParentInteraction;