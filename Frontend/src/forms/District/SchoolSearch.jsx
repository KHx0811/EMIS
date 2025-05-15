import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

const url = import.meta.env.URL;

const SchoolSearch = () => {
  const [searchParams, setSearchParams] = useState({ schoolId: '' });
  const [schoolData, setSchoolData] = useState(null);
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

      const { schoolId } = searchParams;
      console.log('School ID being sent:', schoolId);

      if (!schoolId) {
        setError('Please enter a valid School ID');
        return;
      }

      const response = await axios.get(`${url}/api/districts/search-school/${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSchoolData(response.data.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching school data:', error);
      setError(error.response?.data?.message || 'Error fetching school data');
    }
  };

  return (
    <Box sx={{ padding: '24px', backgroundColor: '#0f172a', borderRadius: '8px' }}>
      <Typography variant="h3" sx={{ color: '#f1f5f9', marginBottom: '16px' }}>
        Search School
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TextField
          label="School ID"
          name="schoolId"
          value={searchParams.schoolId}
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

      {schoolData && (
        <Box sx={{ marginTop: '16px', color: '#f1f5f9' }}>
          <Typography variant="h6">School Details</Typography>
          <Typography>School Name: {schoolData.school_name}</Typography>
          <Typography>School ID: {schoolData.school_id}</Typography>
          <Typography>District ID: {schoolData.district_id}</Typography>
          {schoolData.principal_name && (
            <Typography>Principal: {schoolData.principal_name}</Typography>
          )}
          <Typography>Email: {schoolData.email}</Typography>
          
          {schoolData.date_of_establishment && (
            <Typography>
            Established: {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(schoolData.date_of_establishment))}
          </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SchoolSearch;