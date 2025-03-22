import React, { useState } from 'react';
import { Box, TextField, Button, MenuItem, IconButton, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, Select, InputLabel, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const UpdateStudent = () => {
  const [studentId, setStudentId] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [formData, setFormData] = useState({
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

  const fetchStudentById = async (id) => {
    try {
      const token = localStorage.getItem('adminToken'); 
      if (!token) throw new Error('No token found');
      const response = await axios.get(`http://localhost:3000/api/students/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = response.data.data;
      data.date_of_birth = new Date(data.date_of_birth).toISOString().split('T')[0];
      data.date_of_admission = new Date(data.date_of_admission).toISOString().split('T')[0];
      return data;
    } catch (error) {
      console.error('Error fetching student data:', error);
      alert('Error fetching student data. Please try again.');
      return null;
    }
  };

  const updateStudent = async (id, data) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No token found');
      const response = await axios.put(`http://localhost:3000/api/students/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Student updated successfully:', response.data);
      alert('Student updated successfully');
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Error updating student. Please try again.');
    }
  };

  const handleSearch = async () => {
    const data = await fetchStudentById(studentId);
    setStudentData(data);
    setFormData(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      date_of_birth: new Date(formData.date_of_birth).toISOString(),
      date_of_admission: new Date(formData.date_of_admission).toISOString()
    };
    updateStudent(studentId, formattedData);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Update Student Profile
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          label="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
        />
        <IconButton onClick={handleSearch}>
          <SearchIcon />
        </IconButton>
      </Box>

      {studentData && (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
          <Button type="submit" variant="contained" color="primary">Update</Button>
        </Box>
      )}
    </Box>
  );
};

export default UpdateStudent;