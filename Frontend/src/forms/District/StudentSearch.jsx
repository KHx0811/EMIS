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
      const token = localStorage.getItem('districtToken');
      if (!token) {
        throw new Error('No token found');
      }

      const { studentId } = searchParams;
      console.log('Student ID being sent:', studentId);
      
      if (!studentId) {
        setError('Please enter a valid Student ID');
        return;
      }

      const response = await axios.get(`${url}/api/districts/search-student/${studentId}`, {
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
    <Typography>Student Name: {studentData.name}</Typography>
    <Typography>Student ID: {studentData.student_id}</Typography>
    <Typography>School ID: {studentData.school_id}</Typography>
    {studentData.grade && <Typography>Grade: {studentData.grade}</Typography>}
    {studentData.section && <Typography>Section: {studentData.section}</Typography>}
    {studentData.email && <Typography>Email: {studentData.email}</Typography>}
    
    {studentData.gender && <Typography>Gender: {studentData.gender}</Typography>}
    {studentData.age && <Typography>Age: {studentData.age}</Typography>}
    {studentData.education_level && <Typography>Education Level: {studentData.education_level}</Typography>}
    {studentData.status && <Typography>Status: {studentData.status}</Typography>}
    {studentData.date_of_birth && (
      <Typography>
        Date of Birth: {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(studentData.date_of_birth))}
      </Typography>
    )}
    {studentData.date_of_admission && (
      <Typography>
        Admission Date: {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(studentData.date_of_admission))}
      </Typography>
    )}
    {studentData.class && <Typography>Class: {studentData.class}</Typography>}
    {studentData.year && <Typography>Year: {studentData.year}</Typography>}
    {studentData.degree && <Typography>Degree: {studentData.degree}</Typography>}
    {studentData.specialization && <Typography>Specialization: {studentData.specialization}</Typography>}
    {studentData.religion && <Typography>Religion: {studentData.religion}</Typography>}
    {studentData.nationality && <Typography>Nationality: {studentData.nationality}</Typography>}
    {studentData.address && <Typography>Address: {studentData.address}</Typography>}
    {studentData.parent_id && <Typography>Parent ID: {studentData.parent_id}</Typography>}
        </Box>
      )}
    </Box>
  );
};

export default StudentSearch;