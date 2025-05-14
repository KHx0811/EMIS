import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import config from '@/assets/config';

const { url } = config;

const TeacherSearch = () => {
  const [searchParams, setSearchParams] = useState({ teacherId: '' });
  const [teacherData, setTeacherData] = useState(null);
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

      const { teacherId } = searchParams;
      console.log('Teacher ID being sent:', teacherId);
      if (!teacherId) {
        setError('Please enter a valid Teacher ID');
        return;
      }
      const response = await axios.get(`${url}/api/schools/search-teacher/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTeacherData(response.data.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      setError(error.response?.data?.message || 'Error fetching teacher data');
    }
  };

  return (
    <Box sx={{ padding: '24px', backgroundColor: '#0f172a', borderRadius: '8px' }}>
      <Typography variant="h3" sx={{ color: '#f1f5f9', marginBottom: '16px' }}>
        Search Teacher
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TextField
          label="Teacher ID"
          name="teacherId"
          value={searchParams.teacherId}
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
      {teacherData && (
        <Box sx={{ marginTop: '16px', color: '#f1f5f9' }}>
          <Typography variant="h6">Teacher Details</Typography>
          <Typography>Name: {teacherData.name}</Typography>
          <Typography>Teacher ID: {teacherData.teacher_id}</Typography>
          <Typography>Gender: {teacherData.gender}</Typography>
          <Typography>Age: {teacherData.age}</Typography>
          <Typography>School ID: {teacherData.school_id}</Typography>
          <Typography>Religion: {teacherData.religion}</Typography>
          <Typography>Date of Birth: {new Date(teacherData.date_of_birth).toLocaleDateString()}</Typography>
          <Typography>Nationality: {teacherData.nationality}</Typography>
          <Typography>Qualification: {teacherData.qualification}</Typography>
          <Typography>Email: {teacherData.email}</Typography>
          <Typography>Phone Number: {teacherData.phonenumber}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default TeacherSearch;