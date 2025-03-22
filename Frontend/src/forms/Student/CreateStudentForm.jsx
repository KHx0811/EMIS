import React, { useState } from 'react';
import { Box, TextField, Button, MenuItem, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, Select, InputLabel, Typography } from '@mui/material';
import axios from 'axios';

const CreateStudentForm = ({ onSubmit = () => {} }) => {
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

      // Format the date fields
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
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h3" component="h1" gutterBottom>
          Create Student Form
      </Typography>
      <TextField label="Student ID" name="student_id" value={formData.student_id} onChange={handleChange} required />
      <TextField label="Name" name="name" value={formData.name} onChange={handleChange} required />
      <TextField label="Gender" name="gender" value={formData.gender} onChange={handleChange} select required>
        <MenuItem value="male">Male</MenuItem>
        <MenuItem value="female">Female</MenuItem>
      </TextField>
      <TextField label="Age" name="age" value={formData.age} onChange={handleChange} type="number" required />
      <FormControl component="fieldset">
        <FormLabel component="legend">Education Level</FormLabel>
        <RadioGroup row name="education_level" value={formData.education_level} onChange={handleChange}>
          <FormControlLabel value="secondary" control={<Radio />} label="Secondary" />
          <FormControlLabel value="graduation" control={<Radio />} label="Graduation" />
          <FormControlLabel value="post_graduation" control={<Radio />} label="Post Graduation" />
        </RadioGroup>
      </FormControl>
      {formData.education_level === 'graduation' && (
        <>
          <TextField label="Degree" name="degree" value={formData.degree} onChange={handleChange} required />
          <TextField label="Specialization" name="specialization" value={formData.specialization} onChange={handleChange} required />
        </>
      )}
      <TextField
        label={formData.education_level === 'secondary' ? 'School' : 'College'}
        name="school"
        value={formData.school}
        onChange={handleChange}
        required
      />
      <FormControl component="fieldset">
        <FormLabel component="legend">Status</FormLabel>
        <RadioGroup row name="status" value={formData.status} onChange={handleChange}>
          <FormControlLabel value="active" control={<Radio />} label="Active" />
          <FormControlLabel value="dropout" control={<Radio />} label="Dropout" />
        </RadioGroup>
      </FormControl>
      <TextField label="Date of Birth" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} type="date" InputLabelProps={{ shrink: true }} required />
      <TextField label="Date of Admission" name="date_of_admission" value={formData.date_of_admission} onChange={handleChange} type="date" InputLabelProps={{ shrink: true }} required />
      {formData.education_level === 'secondary' && (
        <FormControl fullWidth>
          <InputLabel>Class</InputLabel>
          <Select label="Class" name="class" value={formData.class} onChange={handleChange} required>
            {Array.from({ length: 12 }, (_, i) => (
              <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {formData.education_level === 'graduation' && (
        <FormControl fullWidth>
          <InputLabel>Year</InputLabel>
          <Select label="Year" name="year" value={formData.year} onChange={handleChange} required>
            {['First Year', 'Second Year', 'Third Year', 'Fourth Year'].map((year, index) => (
              <MenuItem key={index} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {formData.education_level === 'post_graduation' && (
        <FormControl fullWidth>
          <InputLabel>Year</InputLabel>
          <Select label="Year" name="year" value={formData.year} onChange={handleChange} required>
            {['First Year', 'Second Year'].map((year, index) => (
              <MenuItem key={index} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <FormControl component="fieldset">
        <FormLabel component="legend">Religion</FormLabel>
        <RadioGroup row name="religion" value={formData.religion} onChange={handleChange}>
          <FormControlLabel value="hindu" control={<Radio />} label="Hindu" />
          <FormControlLabel value="christian" control={<Radio />} label="Christian" />
          <FormControlLabel value="muslim" control={<Radio />} label="Muslim" />
          <FormControlLabel value="others" control={<Radio />} label="Others" />
        </RadioGroup>
      </FormControl>
      <FormControl component="fieldset">
        <FormLabel component="legend">Nationality</FormLabel>
        <RadioGroup row name="nationality" value={formData.nationality} onChange={handleChange}>
          <FormControlLabel value="indian" control={<Radio />} label="Indian" />
          <FormControlLabel value="nri" control={<Radio />} label="NRI" />
        </RadioGroup>
      </FormControl>
      <TextField label="Address" name="address" value={formData.address} onChange={handleChange} required />
      <TextField label="Parent ID" name="parent_id" value={formData.parent_id} onChange={handleChange} required />
      <TextField label="School ID" name="school_id" value={formData.school_id} onChange={handleChange} required />
      <Button type="submit" variant="contained" color="primary">Submit</Button>
    </Box>
  );
};

export default CreateStudentForm;