import React, { useState } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle, formControlStyle, selectStyle } from '../Student/formStyles';

const url = import.meta.env.URL;

const UpdateParent = () => {
  const navigate = useNavigate();
  const [parentId, setParentId] = useState('');
  const [parentData, setParentData] = useState(null);
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

  const fetchParentById = async (id) => {
    try {
      const token = localStorage.getItem('adminToken'); 
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return null;
      }
      
      const response = await axios.get(`${url}/api/parents/${id}`, {
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
        
        return data;
      } else {
        setError('No data found for this parent ID');
        return null;
      }
    } catch (error) {
      console.error('Error fetching parent data:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('adminToken');
          navigate('/login/admin');
        } else {
          setError(`Error: ${error.response.data?.message || 'Failed to fetch parent data'}`);
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
    if (!parentId.trim()) {
      setError('Please enter a Parent ID');
      return;
    }
    
    setError('');
    try {
      const data = await fetchParentById(parentId);
      if (data) {
        setParentData(data);
        setFormData({
          ...data,
          age: data.age?.toString() || '',
        });
      }
    } catch (error) {
      console.error('Error in handleSearch:', error);
      setError('An error occurred while searching for the parent. Please try again.');
    }
  };

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

      const response = await axios.put(`${url}/api/parents/${parentId}`, dataToSubmit, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Parent updated successfully:', response.data);
      alert('Parent updated successfully');
    } catch (error) {
      console.error('Error updating parent:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('adminToken');
          navigate('/login/admin');
        } else {
          setError(`Error: ${error.response.data?.message || 'Failed to update parent'}`);
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
        Update Parent Profile
      </Typography>

      <Box sx={{ marginBottom: '24px' }}>
        <label style={labelStyle} htmlFor="parent_id_search">Parent ID *</label>
        <Box sx={{ display: 'flex', gap: '10px' }}>
          <input
            id="parent_id_search"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            onKeyPress={handleKeyPress}
            required
            style={{
              ...inputStyle,
              marginBottom: 0,
              flexGrow: 1
            }}
            placeholder="Enter Parent ID"
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

      {parentData && (
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
            <label style={labelStyle} htmlFor="student_id">Student ID *</label>
            <input
              id="student_id"
              name="student_id"
              value={formData.student_id || ''}
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
              value={formData.parent_id || ''}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="Parent ID"
              disabled
            />
          </Box>

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
            <label style={labelStyle} htmlFor="relation">Relation to Student *</label>
            <select
              id="relation"
              name="relation"
              value={formData.relation || ''}
              onChange={handleChange}
              required
              style={selectStyle}
            >
              <option value="" disabled>Select Relation</option>
              <option value="father">Father</option>
              <option value="mother">Mother</option>
              <option value="guardian">Guardian</option>
            </select>
          </Box>

          {formData.relation === 'guardian' && (
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
          )}

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
            <label style={labelStyle} htmlFor="qualification">Qualification *</label>
            <input
              id="qualification"
              name="qualification"
              value={formData.qualification || ''}
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
              value={formData.phonenumber || ''}
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
              Update Parent Profile
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UpdateParent;