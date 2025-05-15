import React, { useState } from 'react';
import { Box, Button, Typography, IconButton, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle } from '../Student/formStyles';

const url = import.meta.env.VITE_API_URL;

const UpdateSchool = () => {
  const navigate = useNavigate();
  const [schoolId, setSchoolId] = useState('');
  const [schoolData, setSchoolData] = useState(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    school_name: '',
    school_id: '',
    district_id: '',
    principal_name: '',
    date_of_establishment: '',
    email: '',
    password: '',
    education_level: 'all',
  });

  const fetchSchoolById = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return null;
      }
      
      const response = await axios.get(`${url}/api/schools/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data) {
        const data = response.data.data;
        if (data.date_of_establishment) {
          data.date_of_establishment = new Date(data.date_of_establishment).toISOString().split('T')[0];
        } else {
          data.date_of_establishment = '';
        }
        
        return data;
      } else {
        setError('No data found for this school ID');
        return null;
      }
    } catch (error) {
      console.error('Error fetching school data:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('adminToken');
          navigate('/login/admin');
        } else {
          setError(`Error: ${error.response.data?.message || 'Failed to fetch school data'}`);
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
    if (!schoolId.trim()) {
      setError('Please enter a School ID');
      return;
    }
    
    setError('');
    try {
      const data = await fetchSchoolById(schoolId);
      if (data) {
        setSchoolData(data);
        setFormData({
          ...data,
        });
      }
    } catch (error) {
      console.error('Error in handleSearch:', error);
      setError('An error occurred while searching for the school. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (name === 'district_id') {
      setError('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const navigateToCreateDistrict = () => {
    sessionStorage.setItem('schoolFormData', JSON.stringify(formData));
    navigate('/dashboard/admin/createDistrict');
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

      const formattedData = {
        ...formData,
        date_of_establishment: new Date(formData.date_of_establishment).toISOString()
      };

      const response = await axios.put(`${url}/api/schools/${schoolId}`, formattedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('School updated successfully:', response.data);
      alert('School updated successfully');
      
    } catch (error) {
      console.error('Error updating school:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('adminToken');
          navigate('/login/admin');
        } else if (error.response.status === 404 && error.response.data.code === 'DISTRICT_NOT_FOUND') {
          setError('The District ID does not exist. Would you like to create it first?');
        } else {
          setError(`Error: ${error.response.data?.message || 'Failed to update school'}`);
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
        Update School Profile
      </Typography>

      <Box sx={{ marginBottom: '24px' }}>
        <label style={labelStyle} htmlFor="school_id_search">School ID *</label>
        <Box sx={{ display: 'flex', gap: '10px' }}>
          <input
            id="school_id_search"
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            onKeyPress={handleKeyPress}
            required
            style={{
              ...inputStyle,
              marginBottom: 0,
              flexGrow: 1
            }}
            placeholder="Enter School ID"
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

      {error && error.includes('District ID does not exist') ? (
        <Alert 
          severity="warning" 
          sx={{ mb: 2, backgroundColor: '#422006', color: '#fef3c7', borderColor: '#d97706' }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={navigateToCreateDistrict}
              sx={{ fontWeight: 'bold' }}
            >
              Create District
            </Button>
          }
        >
          {error}
        </Alert>
      ) : error ? (
        <Box sx={{ 
          backgroundColor: '#b91c1c20', 
          color: '#ef4444', 
          padding: '12px', 
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          {error}
        </Box>
      ) : null}

      {schoolData && (
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
            <label style={labelStyle} htmlFor="school_name">School Name *</label>
            <input
              id="school_name"
              name="school_name"
              value={formData.school_name || ''}
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
              disabled
              style={{...inputStyle, backgroundColor: '#1e293b'}}
            />
          </Box>

          <Box sx={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="district_id">District ID *</label>
            <input
              id="district_id"
              name="district_id"
              value={formData.district_id || ''}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </Box>

          <Box sx={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="principal_name">Principal Name *</label>
            <input
              id="principal_name"
              name="principal_name"
              value={formData.principal_name || ''}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </Box>
          <Box sx={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="education_level">Education Level *</label>
            <select
              id="education_level"
              name="education_level"
              value={formData.education_level || ''}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="secondary">Secondary</option>
              <option value="graduation">Graduation</option>
              <option value="post_graduation">Post Graduation</option>
              <option value="all">All</option>
            </select>
          </Box>

          <Box sx={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="date_of_establishment">Date of Establishment *</label>
            <input
              id="date_of_establishment"
              name="date_of_establishment"
              type="date"
              value={formData.date_of_establishment || ''}
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
              value={formData.email || ''}
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
              Update School Profile
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UpdateSchool;