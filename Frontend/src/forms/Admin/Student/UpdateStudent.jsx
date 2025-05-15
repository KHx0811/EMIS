import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Radio, RadioGroup, FormControlLabel, Typography, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle, formControlStyle, selectStyle } from './formStyles';

const url = import.meta.env.VITE_API_URL;

const UpdateStudent = () => {
  const navigate = useNavigate();
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
  const [error, setError] = useState('');

  const fetchStudentById = async (id) => {
    try {
      const token = localStorage.getItem('adminToken'); 
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return null;
      }
      
      const response = await axios.get(`${url}/api/students/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data) {
        const data = response.data.data;
        if (data.date_of_birth) {
          data.date_of_birth = new Date(data.date_of_birth).toISOString().split('T')[0];
        } else {
          data.date_of_birth = '';
        }
        
        if (data.date_of_admission) {
          data.date_of_admission = new Date(data.date_of_admission).toISOString().split('T')[0];
        } else {
          data.date_of_admission = '';
        }
        
        return data;
      } else {
        setError('No data found for this student ID');
        return null;
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('adminToken');
          navigate('/login/admin');
        } else {
          setError(`Error: ${error.response.data?.message || 'Failed to fetch student data'}`);
        }
      } else if (error.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      return null;
    }
  };

  const handleSearch = async () => {
    if (!studentId.trim()) {
      setError('Please enter a Student ID');
      return;
    }
    
    setError('');
    try {
      const data = await fetchStudentById(studentId);
      if (data) {
        setStudentData(data);
        setFormData({
          ...data,
          age: data.age?.toString() || '',
          class: data.class?.toString() || '',
        });
      }
    } catch (error) {
      console.error('Error in handleSearch:', error);
      setError('An error occurred while searching for the student. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return;
      }
      const dataToSubmit = { ...formData };
      
      if (dataToSubmit.date_of_birth) {
        try {
          dataToSubmit.date_of_birth = new Date(dataToSubmit.date_of_birth).toISOString();
        } catch (e) {
          setError('Invalid date of birth format');
          return;
        }
      }
      
      if (dataToSubmit.date_of_admission) {
        try {
          dataToSubmit.date_of_admission = new Date(dataToSubmit.date_of_admission).toISOString();
        } catch (e) {
          setError('Invalid date of admission format');
          return;
        }
      }

      const response = await axios.put(`${url}/api/students/${studentId}`, dataToSubmit, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Student updated successfully:', response.data);
      alert('Student updated successfully');
    } catch (error) {
      console.error('Error updating student:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('adminToken');
          navigate('/login/admin');
        } else {
          setError(`Error: ${error.response.data?.message || 'Failed to update student'}`);
        }
      } else if (error.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <Box 
      sx={{ 
        backgroundColor: '#111827',
        padding: '24px',
        borderRadius: '8px',
        maxWidth: '100%'
      }}
    >
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom
        sx={{ 
          color: '#f1f5f9',
          marginBottom: '24px',
          borderBottom: '1px solid #1e293b',
          paddingBottom: '16px',
        }}
      >
        Update Student Profile
      </Typography>

      <Box sx={{ marginBottom: '24px' }}>
        <label style={labelStyle} htmlFor="student_id_search">Student ID *</label>
        <Box sx={{ display: 'flex', gap: '10px' }}>
          <input
            id="student_id_search"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            onKeyPress={handleKeyPress}
            required
            style={{
              ...inputStyle,
              marginBottom: 0,
              flexGrow: 1
            }}
            placeholder="Enter Student ID"
          />
          <IconButton 
            onClick={handleSearch}
            sx={{ 
              color: '#f1f5f9',
              backgroundColor: '#3b82f6',
              borderRadius: '6px',
              padding: '8px',
              '&:hover': {
                backgroundColor: '#2563eb',
              }
            }}
          >
            <SearchIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Box sx={{ 
          backgroundColor: '#b91c1c20', 
          color: '#ef4444', 
          padding: '12px', 
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          {error}
        </Box>
      )}

      {studentData && (
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
          <Box sx={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="name">Name *</label>
            <input
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </Box>

          <Box sx={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="gender">Gender *</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender || ''}
              onChange={handleChange}
              required
              style={selectStyle}
            >
              <option value="" disabled>Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </Box>

          <Box sx={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="age">Age *</label>
            <input
              id="age"
              name="age"
              type="number"
              value={formData.age || ''}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </Box>

          <FormControl component="fieldset" sx={formControlStyle}>
            <FormLabel component="legend" sx={{ color: '#f1f5f9' }}>Education Level *</FormLabel>
            <RadioGroup row name="education_level" value={formData.education_level || ''} onChange={handleChange}>
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
                  value={formData.degree || ''}
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
                  value={formData.specialization || ''}
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
              value={formData.school || ''}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </Box>

          <FormControl component="fieldset" sx={formControlStyle}>
            <FormLabel component="legend" sx={{ color: '#f1f5f9' }}>Status *</FormLabel>
            <RadioGroup row name="status" value={formData.status || ''} onChange={handleChange}>
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
              value={formData.date_of_birth || ''}
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
              value={formData.date_of_admission || ''}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </Box>

          {formData.education_level === 'secondary' && (
            <Box sx={{ marginBottom: '16px' }}>
              <label style={labelStyle} htmlFor="class">Class *</label>
              <select
                id="class"
                name="class"
                value={formData.class || ''}
                onChange={handleChange}
                required
                style={selectStyle}
              >
                <option value="" disabled>Select Class</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={(i + 1).toString()}>{i + 1}</option>
                ))}
              </select>
            </Box>
          )}

          {(formData.education_level === 'graduation' || formData.education_level === 'post_graduation') && (
            <Box sx={{ marginBottom: '16px' }}>
              <label style={labelStyle} htmlFor="year">Year *</label>
              <select
                id="year"
                name="year"
                value={formData.year || ''}
                onChange={handleChange}
                required
                style={selectStyle}
              >
                <option value="" disabled>Select Year</option>
                {(formData.education_level === 'graduation' 
                  ? ['First Year', 'Second Year', 'Third Year', 'Fourth Year']
                  : ['First Year', 'Second Year']
                ).map((year, index) => (
                  <option key={index} value={year}>{year}</option>
                ))}
              </select>
            </Box>
          )}

          <FormControl component="fieldset" sx={formControlStyle}>
            <FormLabel component="legend" sx={{ color: '#f1f5f9' }}>Religion</FormLabel>
            <RadioGroup row name="religion" value={formData.religion || ''} onChange={handleChange}>
              <FormControlLabel value="hindu" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Hindu" />
              <FormControlLabel value="christian" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Christian" />
              <FormControlLabel value="muslim" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Muslim" />
              <FormControlLabel value="others" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Others" />
            </RadioGroup>
          </FormControl>

          <FormControl component="fieldset" sx={formControlStyle}>
            <FormLabel component="legend" sx={{ color: '#f1f5f9' }}>Nationality</FormLabel>
            <RadioGroup row name="nationality" value={formData.nationality || ''} onChange={handleChange}>
              <FormControlLabel value="indian" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Indian" />
              <FormControlLabel value="nri" control={<Radio sx={{ color: '#f1f5f9' }} />} label="NRI" />
            </RadioGroup>
          </FormControl>

          <Box sx={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="address">Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address || ''}
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
              value={formData.parent_id || ''}
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
              value={formData.school_id || ''}
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
              Update Student Profile
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UpdateStudent;