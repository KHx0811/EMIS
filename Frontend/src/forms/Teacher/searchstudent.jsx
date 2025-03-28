import React, { useState } from 'react';
import { Box, TextField, IconButton, Typography, Snackbar, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SearchStudent = () => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState(null);

  const fetchStudentById = async (id) => {
    try {
      const token = localStorage.getItem('teacherToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get(`http://localhost:3000/api/students/${id}`,
        {}, // Empty body
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Log the full response for debugging
      console.log('Student Search Response:', response.data);

      return response.data.data;
    } catch (error) {
      console.error('Detailed error fetching student data:', error.response || error);
      
      if (error.response) {
        const errorMessage = error.response.data.message || 'Error fetching student data';
        setError(errorMessage);
        
        if (error.response.status === 401 || error.response.status === 403) {
          localStorage.removeItem('teacherToken');
          localStorage.removeItem('teacherUsername');
          navigate('/login/teacher');
        }
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('Error: ' + error.message);
      }
      
      return null;
    }
  };

  const handleSearch = async () => {
    if (!studentId.trim()) {
      setError('Please enter a student ID');
      return;
    }

    setError(null);
    setStudentData(null);
    const data = await fetchStudentById(studentId);
    setStudentData(data);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  // Helper function to safely render field
  const renderField = (label, value) => {
    return value ? (
      <Typography>
        <strong>{label}:</strong> {value}
      </Typography>
    ) : null;
  };

  return (
    <Box
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
        Search Student Profile
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          label="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          onKeyPress={handleKeyPress}
          required
          fullWidth
          size="small"
          variant="filled"
          sx={{ 
            backgroundColor: '#1F2A40',
            color: '#e0e0e0',
            '& .MuiFilledInput-root': {
              backgroundColor: '#1F2A40',
              color: '#e0e0e0'
            }
          }}
        />
        <IconButton
          onClick={handleSearch}
          sx={{
            color: '#f1f5f9',
            backgroundColor: '#3b82f6',
            borderRadius: '50px',
            padding: '12px',
            marginLeft: '8px',
            '&:hover': {
              backgroundColor: '#2563eb',
            }
          }}
        >
          <SearchIcon />
        </IconButton>
      </Box>

      {error && (
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseError} 
            severity="error" 
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      )}

      {studentData && (
        <Box sx={{ mt: 2, color: '#f1f5f9' }}>
          <Typography variant="h6" sx={{ mb: 2, borderBottom: '1px solid #475569', pb: 1 }}>
            Student Details
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            {renderField('Name', studentData.name)}
            {renderField('Student ID', studentData.student_id)}
            {renderField('Gender', studentData.gender)}
            {renderField('Age', studentData.age)}
            {renderField('Education Level', studentData.education_level)}
            {renderField('School', studentData.school)}
            {renderField('Status', studentData.status)}
            {renderField('Date of Birth', studentData.date_of_birth ? new Date(studentData.date_of_birth).toLocaleDateString() : null)}
            {renderField('Date of Admission', studentData.date_of_admission ? new Date(studentData.date_of_admission).toLocaleDateString() : null)}
            
            {studentData.education_level === 'secondary' && renderField('Class', studentData.class)}
            {studentData.education_level !== 'secondary' && renderField('Year', studentData.year)}
            
            {studentData.education_level === 'graduation' && (
              <>
                {renderField('Degree', studentData.degree)}
                {renderField('Specialization', studentData.specialization)}
              </>
            )}

            {renderField('Religion', studentData.religion)}
            {renderField('Nationality', studentData.nationality)}
            {renderField('Address', studentData.address)}
            {renderField('Parent ID', studentData.parent_id)}
            {renderField('School ID', studentData.school_id)}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SearchStudent;