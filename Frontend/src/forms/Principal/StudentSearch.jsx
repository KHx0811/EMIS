import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

const url = import.meta.env.VITE_API_URL;


const StudentSearch = () => {
  const [searchParams, setSearchParams] = useState({ studentId: '' });
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({ ...searchParams, [name]: value });
  };

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem('principalToken');
      if (!token) {
        throw new Error('No token found');
      }

      const { studentId } = searchParams;
      console.log('Student ID being sent:', studentId);
      if (!studentId) {
        setError('Please enter a valid Student ID');
        return;
      }
      const response = await axios.get(`${url}/api/schools/search-student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStudentData(response.data.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching student data:', error);
      setError(error.response?.data?.message || 'Error fetching student data');
    }
  };

  return (
    <Box sx={{ padding: '24px', backgroundColor: '#0f172a', borderRadius: '8px' }}>
      <Typography variant="h3" sx={{ color: '#f1f5f9', marginBottom: '16px' }}>
        Search Student
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TextField
          label="Student ID"
          name="studentId"
          value={searchParams.studentId}
          onChange={handleChange}
          fullWidth
          variant="filled"
          sx={{ backgroundColor: '#1F2A40', color: '#e0e0e0' }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{ backgroundColor: '#3b82f6', color: '#f1f5f9' }}
        >
          Search
        </Button>
      </Box>
      {error && (
        <Snackbar open autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      )}
      {studentData && (
        <Box sx={{ marginTop: '16px', color: '#f1f5f9' }}>
          <Typography variant="h6">Student Details</Typography>
          <Typography>Name: {studentData.name}</Typography>
          <Typography>Student ID: {studentData.student_id}</Typography>
          <Typography>Gender: {studentData.gender}</Typography>
          <Typography>Age: {studentData.age}</Typography>
          <Typography>Education Level: {studentData.education_level}</Typography>
          <Typography>School: {studentData.school}</Typography>
          <Typography>Status: {studentData.status}</Typography>
          <Typography>Date of Birth: {new Date(studentData.date_of_birth).toLocaleDateString()}</Typography>
          <Typography>Date of Admission: {new Date(studentData.date_of_admission).toLocaleDateString()}</Typography>
          {studentData.education_level === 'secondary' && (
            <Typography>Class: {studentData.class}</Typography>
          )}
          {studentData.education_level !== 'secondary' && (
            <Typography>Year: {studentData.year}</Typography>
          )}
          {studentData.education_level === 'graduation' && (
            <>
              <Typography>Degree: {studentData.degree}</Typography>
              <Typography>Specialization: {studentData.specialization}</Typography>
            </>
          )}
          <Typography>Religion: {studentData.religion}</Typography>
          <Typography>Nationality: {studentData.nationality}</Typography>
          <Typography>Address: {studentData.address}</Typography>
          <Typography>Parent ID: {studentData.parent_id}</Typography>
          <Typography>School ID: {studentData.school_id}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default StudentSearch;