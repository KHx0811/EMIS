import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, MenuItem, Radio, RadioGroup, FormControlLabel, Select, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle,labelStyle, formControlStyle, selectStyle } from './formStyles';

const CreateStudentForm = ({ onSubmit = () => {} }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    gender: '',
    age: '',
    education_level: '',
    school: '',
    status: '',
    date_of_birth: '',
    date_of_admission: '',
    class: '',
    year: '',
    degree: '',
    specialization: '',
    religion: '',
    nationality: '',
    address: '',
    parent_id: '',
    school_id: '',
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
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return;
      }

      const formattedData = {
        ...formData,
        date_of_birth: new Date(formData.date_of_birth).toISOString(),
        date_of_admission: new Date(formData.date_of_admission).toISOString()
      };

      const response = await axios.post('http://localhost:3000/api/students', formattedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Student created successfully:', response.data);
      alert('Student created successfully');
      onSubmit(response.data);
    } catch (error) {
      console.error('Error creating student:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('adminToken');
          navigate('/login/admin');
        } else {
          alert(`Error creating student: ${error.response.data.message || 'Please try again.'}`);
        }
      } else {
        alert('Error creating student. Please check your network connection.');
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
        Create Student Form
      </Typography>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="student_id">Student ID *</label>
        <input
          id="student_id"
          name="student_id"
          value={formData.student_id}
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

      <FormControl component="fieldset" sx={formControlStyle}>
        <FormLabel component="legend" sx={{ color: '#f1f5f9' }}>Education Level *</FormLabel>
        <RadioGroup row name="education_level" value={formData.education_level} onChange={handleChange}>
          <FormControlLabel value="secondary" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Secondary" />
          <FormControlLabel value="graduation" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Graduation" />
          <FormControlLabel value="post_graduation" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Post Graduation" />
        </RadioGroup>
      </FormControl>

      {formData.education_level === 'graduation' && (
        <>
          <Box sx={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="degree">Degree *</label>
            <input
              id="degree"
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </Box>

          <Box sx={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="specialization">Specialization *</label>
            <input
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </Box>
        </>
      )}

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="school">
          {formData.education_level === 'secondary' ? 'School *' : 'College *'}
        </label>
        <input
          id="school"
          name="school"
          value={formData.school}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <FormControl component="fieldset" sx={formControlStyle}>
        <FormLabel component="legend" sx={{ color: '#f1f5f9' }}>Status *</FormLabel>
        <RadioGroup row name="status" value={formData.status} onChange={handleChange}>
          <FormControlLabel value="active" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Active" />
          <FormControlLabel value="dropout" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Dropout" />
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

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="date_of_admission">Date of Admission *</label>
        <input
          id="date_of_admission"
          name="date_of_admission"
          type="date"
          value={formData.date_of_admission}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      {formData.education_level === 'secondary' && (
        <Box sx={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="class">Class *</label>
          <Select
            id="class"
            name="class"
            value={formData.class}
            onChange={handleChange}
            required
            sx={selectStyle}
            displayEmpty
          >
            <MenuItem value="" disabled>Select Class</MenuItem>
            {Array.from({ length: 12 }, (_, i) => (
              <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
            ))}
          </Select>
        </Box>
      )}

      {(formData.education_level === 'graduation' || formData.education_level === 'post_graduation') && (
        <Box sx={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="year">Year *</label>
          <Select
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            sx={selectStyle}
            displayEmpty
          >
            <MenuItem value="" disabled>Select Year</MenuItem>
            {(formData.education_level === 'graduation' 
              ? ['First Year', 'Second Year', 'Third Year', 'Fourth Year']
              : ['First Year', 'Second Year']
            ).map((year, index) => (
              <MenuItem key={index} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </Box>
      )}

      <FormControl component="fieldset" sx={formControlStyle}>
        <FormLabel component="legend" sx={{ color: '#f1f5f9' }}>Religion</FormLabel>
        <RadioGroup row name="religion" value={formData.religion} onChange={handleChange}>
          <FormControlLabel value="hindu" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Hindu" />
          <FormControlLabel value="christian" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Christian" />
          <FormControlLabel value="muslim" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Muslim" />
          <FormControlLabel value="others" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Others" />
        </RadioGroup>
      </FormControl>

      <FormControl component="fieldset" sx={formControlStyle}>
        <FormLabel component="legend" sx={{ color: '#f1f5f9' }}>Nationality</FormLabel>
        <RadioGroup row name="nationality" value={formData.nationality} onChange={handleChange}>
          <FormControlLabel value="indian" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Indian" />
          <FormControlLabel value="nri" control={<Radio sx={{ color: '#f1f5f9' }} />} label="NRI" />
        </RadioGroup>
      </FormControl>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="address">Address *</label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          style={{...inputStyle, minHeight: '80px', resize: 'vertical'}}
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
          Create Student Profile
        </Button>
      </Box>
    </Box>
  );
};

export default CreateStudentForm;