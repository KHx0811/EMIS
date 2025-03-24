import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, MenuItem, Radio, RadioGroup, FormControlLabel, Select, Typography,Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle, selectStyle, formControlStyle } from '../Student/formStyles';

const CreateTeacher = ({ onSubmit = () => {} }) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    teacher_id: '',
    name: '',
    gender: '',
    age: '',
    school_id: '',
    religion: '',
    date_of_birth: '',
    nationality: '',
    qualification: '',
    email: '',
    phonenumber: '',
    password: '',
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (name === 'school_id') {
      setError('');
    }
  };

  const navigateToCreateSchool = () => {
    sessionStorage.setItem('teacherFormData', JSON.stringify(formData));
    navigate('/dashboard/admin/createSchool');
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
        date_of_birth: new Date(formData.date_of_birth).toISOString()
      };
  
      const response = await axios.post('http://localhost:3000/api/teachers', formattedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Teacher created successfully:', response.data);
      alert('Teacher created successfully');
      onSubmit(response.data);
    } catch (error) {
      console.error('Error creating teacher:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('adminToken');
          navigate('/login/admin');
        } else if (error.response.status === 400) {
          setError('Enter all fields to create teacher profile.');
        } else if (error.response.status === 404 && error.response.data.code === 'SCHOOL_NOT_FOUND') {
          setError('The School ID does not exist. Would you like to create it first?');
        } else {
          alert(`Error creating teacher: ${error.response.data.message || 'Please try again.'}`);
        }
      } else {
        alert('Error creating teacher. Please check your network connection.');
      }
    }
  };

  React.useEffect(() => {
    const savedData = sessionStorage.getItem('teacherFormData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

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
        Create Teacher Form
      </Typography>

      {error && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2, backgroundColor: '#422006', color: '#fef3c7', borderColor: '#d97706' }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={navigateToCreateSchool}
              sx={{ fontWeight: 'bold' }}
            >
              Create School
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="teacher_id">Teacher ID *</label>
        <input
          id="teacher_id"
          name="teacher_id"
          value={formData.teacher_id}
          onChange={handleChange}
          required
          style={inputStyle}
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
        <label style={labelStyle} htmlFor="school_id">School ID *</label>
        <input
          id="school_id"
          name="school_id"
          value={formData.school_id}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <FormControl component="fieldset" sx={formControlStyle}>
        <FormLabel component="legend" sx={{ color: '#f1f5f9' }}>Religion *</FormLabel>
        <RadioGroup row name="religion" value={formData.religion} onChange={handleChange}>
          <FormControlLabel value="hindu" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Hindu" />
          <FormControlLabel value="christian" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Christian" />
          <FormControlLabel value="muslim" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Muslim" />
          <FormControlLabel value="others" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Others" />
        </RadioGroup>
      </FormControl>

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

      <FormControl component="fieldset" sx={formControlStyle}>
        <FormLabel component="legend" sx={{ color: '#f1f5f9' }}>Nationality *</FormLabel>
        <RadioGroup row name="nationality" value={formData.nationality} onChange={handleChange}>
          <FormControlLabel value="indian" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Indian" />
          <FormControlLabel value="nri" control={<Radio sx={{ color: '#f1f5f9' }} />} label="NRI" />
        </RadioGroup>
      </FormControl>

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
          Create Teacher Profile
        </Button>
      </Box>
    </Box>
  );
};

export default CreateTeacher;