import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, MenuItem, Select, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle, formControlStyle, selectStyle } from '../Student/formStyles';

const url = import.meta.env.VITE_API_URL;

const CreateParentForm = ({ onSubmit = () => {} }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    parent_id: '',
    student_id: '',
    name: '',
    gender: '',
    relation: '',
    age: '',
    date_of_birth: '',
    qualification: '',
    phonenumber: '',
    email: '',
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };

    if (name === 'relation') {
      if (value === 'father') {
        updatedFormData.gender = 'male';
      } else if (value === 'mother') {
        updatedFormData.gender = 'female';
      } else {
        updatedFormData.gender = '';
      }
    }

    setFormData(updatedFormData);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('You are not logged in. Please login to continue.');
        return;
      }

      const formattedData = {
        ...formData,
        date_of_birth: new Date(formData.date_of_birth).toISOString()
      };

      const response = await axios.post(`${url}/api/parents`, formattedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Parent created successfully:', response.data);
      alert('Parent created successfully');
      onSubmit(response.data);
      
      setFormData({
        parent_id: '',
        student_id: '',
        name: '',
        gender: '',
        relation: '',
        age: '',
        date_of_birth: '',
        qualification: '',
        phonenumber: '',
        email: '',
      });
    } catch (error) {
      console.error('Error creating parent:', error);
      
      if (error.response) {
        if (error.response.status === 404) {
          setError('Student ID not found. Please check the ID.');
        } else if (error.response.status === 409) {
          setError('Parent ID not found. Please check the ID.');
        } else {
          setError(error.response.data.message || 'Failed to create parent. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
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
        Create Parent Form
      </Typography>
      
      {error && (
        <Box sx={{ 
          backgroundColor: 'rgba(239, 68, 68, 0.2)', 
          color: '#f87171', 
          padding: '12px', 
          borderRadius: '4px',
          marginBottom: '16px' 
        }}>
          {error}
        </Box>
      )}
      
      {success && (
        <Box sx={{ 
          backgroundColor: 'rgba(34, 197, 94, 0.2)', 
          color: '#4ade80', 
          padding: '12px', 
          borderRadius: '4px',
          marginBottom: '16px' 
        }}>
          {success}
        </Box>
      )}

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="student_id">Student ID *</label>
        <input
          id="student_id"
          name="student_id"
          value={formData.student_id}
          onChange={handleChange}
          required
          style={inputStyle}
          placeholder="Enter the ID of the student this parent is associated with"
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="parent_id">Parent ID *</label>
        <input
          id="parent_id"
          name="parent_id"
          value={formData.parent_id}
          onChange={handleChange}
          required
          style={inputStyle}
          placeholder="Create a unique ID for this parent"
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="name">Name *</label>
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="relation">Relation to Student *</label>
        <Select
          id="relation"
          name="relation"
          value={formData.relation}
          onChange={handleChange}
          required
          sx={selectStyle}
          displayEmpty
        >
          <MenuItem value="" disabled>Select Relation</MenuItem>
          <MenuItem value="father">Father</MenuItem>
          <MenuItem value="mother">Mother</MenuItem>
          <MenuItem value="guardian">Guardian</MenuItem>
        </Select>
      </Box>

      {formData.relation === 'guardian' && (
        <Box sx={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="gender">Gender *</label>
          <Select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            sx={selectStyle}
            displayEmpty
          >
            <MenuItem value="" disabled>Select Gender</MenuItem>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
          </Select>
        </Box>
      )}

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="age">Age *</label>
        <input
          id="age"
          name="age"
          type="number"
          value={formData.age}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="date_of_birth">Date of Birth *</label>
        <input
          id="date_of_birth"
          name="date_of_birth"
          type="date"
          value={formData.date_of_birth}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="qualification">Qualification *</label>
        <input
          id="qualification"
          name="qualification"
          value={formData.qualification}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="phonenumber">Phone Number *</label>
        <input
          id="phonenumber"
          name="phonenumber"
          value={formData.phonenumber}
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
          Create Parent Profile
        </Button>
      </Box>
    </Box>
  );
};

export default CreateParentForm;