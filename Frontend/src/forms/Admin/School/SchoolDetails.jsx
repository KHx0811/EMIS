import React, { useState } from 'react';
import { Box, TextField, IconButton, Typography, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle } from '../Student/formStyles';

const url = import.meta.env.VITE_API_URL;

const SchoolDetails = () => {
  const navigate = useNavigate();
  const [schoolId, setSchoolId] = useState('');
  const [schoolData, setSchoolData] = useState(null);
  const [error, setError] = useState('');

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
      const data = response.data.data;
      if (data.date_of_establishment) {
        data.date_of_establishment = new Date(data.date_of_establishment).toLocaleDateString('en-GB');
      }
      return data;
    } catch (error) {
      console.error('Error fetching school data:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('adminToken');
        navigate('/login/admin');
      } else if (error.response) {
        setError(`Error: ${error.response.data?.message || 'Failed to fetch school data'}`);
      } else {
        setError('Error fetching school data. Please try again.');
      }
      return null;
    }
  };

  const fetchAllSchools = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return [];
      }
      const response = await axios.get(`${url}/api/schools`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching all schools:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('adminToken');
        navigate('/login/admin');
      } else {
        alert('Error fetching all schools. Please try again.');
      }
      return [];
    }
  };

  const handleSearch = async () => {
    if (!schoolId.trim()) {
      setError('Please enter a School ID');
      return;
    }
    
    setError('');
    const data = await fetchSchoolById(schoolId);
    setSchoolData(data);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDownloadReport = async () => {
    const schools = await fetchAllSchools();
    const doc = new jsPDF();
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(18);
    doc.text('All Schools Report', 14, yPosition);
    yPosition += 10;

    doc.setFontSize(12);

    schools.forEach((school, index) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont(undefined, 'bold');
      doc.text(`School ${index + 1}:`, 14, yPosition);
      doc.setFont(undefined, 'normal');
      yPosition += 8;

      const schoolData = [
        `School ID: ${school.school_id || 'N/A'}`,
        `School Name: ${school.school_name || 'N/A'}`,
        `District ID: ${school.district_id || 'N/A'}`,
        `Principal Name: ${school.principal_name || 'N/A'}`,
        `Date of Establishment: ${school.date_of_establishment ? new Date(school.date_of_establishment).toLocaleDateString('en-GB') : 'N/A'}`,
        `Email: ${school.email || 'N/A'}`
      ];

      schoolData.forEach(line => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }

        const textLines = doc.splitTextToSize(line, 180);
        doc.text(textLines, 20, yPosition);
        yPosition += 7 * textLines.length;
      });

      yPosition += 10;

      if (index < schools.length - 1) {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        } else {
          doc.setDrawColor(200, 200, 200);
          doc.line(14, yPosition - 5, 196, yPosition - 5);
          yPosition += 5;
        }
      }
    });

    doc.save('schools_report.pdf');
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
        Get School Profile
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ marginBottom: '24px', flexGrow: 1 }}>
          <label style={labelStyle} htmlFor="school_id">School ID</label>
          <input
            id="school_id"
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            onKeyPress={handleKeyPress}
            required
            style={inputStyle}
            placeholder="Enter School ID"
          />
        </Box>
        
        <IconButton
          onClick={handleSearch}
          sx={{
            color: '#f1f5f9',
            backgroundColor: '#3b82f6',
            borderRadius: '50px',
            padding: '12px',
            marginLeft: '8px',
            marginBottom: '24px',
            '&:hover': {
              backgroundColor: '#2563eb',
            }
          }}
        >
          <SearchIcon />
        </IconButton>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleDownloadReport}
          sx={{
            backgroundColor: '#3b82f6',
            color: '#f1f5f9',
            padding: '8px 16px',
            marginBottom: '24px',
            marginLeft: '8px',
            '&:hover': {
              backgroundColor: '#2563eb',
            }
          }}
        >
          Download All Schools Report
        </Button>
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

      {schoolData && (
        <Box sx={{ mt: 2, color: '#f1f5f9' }}>
          <Typography variant="h6">School Details</Typography>
          <Typography>School Name            : {schoolData.school_name}</Typography>
          <Typography>School ID              : {schoolData.school_id}</Typography>
          <Typography>District ID            : {schoolData.district_id}</Typography>
          <Typography>Principal Name         : {schoolData.principal_name}</Typography>
          <Typography>Date of Establishment  : {schoolData.date_of_establishment}</Typography>
          <Typography>Email                  : {schoolData.email}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default SchoolDetails;