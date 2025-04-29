import React, { useState } from 'react';
import { Box, TextField, IconButton, Typography, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';

const DistrictList = () => {
  const navigate = useNavigate();
  const [districtId, setDistrictId] = useState('');
  const [districtData, setDistrictData] = useState(null);

  const fetchDistrictById = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return null;
      }
      const response = await axios.get(`http://localhost:3000/api/districts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching district data:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('adminToken');
        navigate('/login/admin');
      } else {
        alert('Error fetching district data. Please try again.');
      }
      return null;
    }
  };

  const fetchAllDistricts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return [];
      }
      const response = await axios.get('http://localhost:3000/api/districts', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching all districts:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('adminToken');
        navigate('/login/admin');
      } else {
        alert('Error fetching all districts. Please try again.');
      }
      return [];
    }
  };

  const handleSearch = async () => {
    const data = await fetchDistrictById(districtId);
    setDistrictData(data);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDownloadReport = async () => {
    const districts = await fetchAllDistricts();
    const doc = new jsPDF();
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(18);
    doc.text('All Districts Report', 14, yPosition);
    yPosition += 10;

    doc.setFontSize(12);

    districts.forEach((district, index) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont(undefined, 'bold');
      doc.text(`District ${index + 1}:`, 14, yPosition);
      doc.setFont(undefined, 'normal');
      yPosition += 8;

      const districtData = [
        `District ID: ${district.district_id || 'N/A'}`,
        `District Name: ${district.district_name || 'N/A'}`,
        `DistrictHead Name: ${district.districthead_name || 'N/A'}`,
        `State: ${district.state || 'N/A'}`,
        `Email: ${district.email || 'N/A'}`
      ];

      districtData.forEach(line => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }

        const textLines = doc.splitTextToSize(line, 180);
        doc.text(textLines, 20, yPosition);
        yPosition += 7 * textLines.length; // Increase y-position based on number of lines
      });

      yPosition += 10;

      if (index < districts.length - 1) {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        } else {
          doc.setDrawColor(200, 200, 200); // Light gray
          doc.line(14, yPosition - 5, 196, yPosition - 5);
          yPosition += 5;
        }
      }
    });

    doc.save('districts_report.pdf');
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
        Get District Profile
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          label="District ID"
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          onKeyPress={handleKeyPress}
          required
          halfWidth
          size='Small'
          variant='filled'
          sx={{ textDecoration: 'none', borderColor: 'none' }}
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
        <Button
          variant="contained"
          color="primary"
          onClick={handleDownloadReport}
          sx={{
            backgroundColor: '#3b82f6',
            color: '#f1f5f9',
            padding: '8px 16px',
            '&:hover': {
              backgroundColor: '#2563eb',
            },
            marginLeft: 'auto'
          }}
        >
          Download All Districts Report
        </Button>
      </Box>

      {districtData && (
        <Box sx={{ mt: 2, height: '100vh', color: '#f1f5f9' }}>
          <Typography variant="h6">District Details</Typography>
          <Typography>District ID      : {districtData.district_id}</Typography>
          <Typography>District Name    : {districtData.district_name}</Typography>
          <Typography>DistrictHead Name    : {districtData.districthead_name}</Typography>
          <Typography>State            : {districtData.state}</Typography>
          <Typography>Email            : {districtData.email}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default DistrictList;