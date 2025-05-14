import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, FormControl, Select, MenuItem } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle, formControlStyle } from '../Admin/Student/formStyles.js';
import config from '@/assets/config';

const { url } = config;

const Marks = () => {
  const navigate = useNavigate();
  const [childDetails, setChildDetails] = useState(null);
  const [marksRecords, setMarksRecords] = useState([]);
  const [filteredMarks, setFilteredMarks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [examType, setExamType] = useState('');
  const [subject, setSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [examTypes, setExamTypes] = useState([
    'Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'Unit Test', 'Project'
  ]);


  useEffect(() => {
    fetchChildDetails();
  }, [navigate]);

  useEffect(() => {
    if (marksRecords.length > 0) {
      const uniqueSubjects = [...new Set(marksRecords.map(record => record.subject))];
      setSubjects(uniqueSubjects);
    }
  }, [marksRecords]);

  const fetchChildDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('parentToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/parent');
        return;
      }

      const response = await axios.get(`${url}/api/parents/child-details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setChildDetails(response.data.data);
      fetchAllMarks(response.data.data.student_id);
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('parentToken');
        navigate('/login/parent');
      } else {
        console.error('Error fetching child details:', error);
        alert('Error fetching child details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMarks = async (studentId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('parentToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/parent');
        return;
      }

      const response = await axios.get(`${url}/api/parents/child-marks/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setMarksRecords(response.data.data || []);
    } catch (error) {
      console.error('Error fetching marks records:', error);
      alert('Error fetching marks records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExamTypeChange = (e) => {
    setExamType(e.target.value);
  };

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
  };

  const handleSearch = () => {
    if (!examType && !subject) {
      alert('Please select at least one filter (Exam Type or Subject).');
      return;
    }

    let filtered = [...marksRecords];
    
    if (examType) {
      filtered = filtered.filter(record => record.examType === examType);
    }
    
    if (subject) {
      filtered = filtered.filter(record => record.subject === subject);
    }

    setFilteredMarks(filtered);
  };


  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };


  const calculatePercentage = (value, maxMarks) => {
    return ((value / maxMarks) * 100).toFixed(2);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0f172a',
        padding: '24px',
        borderRadius: '8px',
        color: '#f1f5f9',
      }}
    >
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{
          color: '#f1f5f9',
          marginBottom: '24px',
        }}
      >
        Child Academic Performance
      </Typography>

      {childDetails && (
        <Box sx={{ marginBottom: '24px' }}>
          <Typography variant="h5" sx={{ color: '#f1f5f9', marginBottom: '8px' }}>
            Student Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Typography sx={{ color: '#f1f5f9' }}>
              <strong>Student ID:</strong> {childDetails.student_id}
            </Typography>
            <Typography sx={{ color: '#f1f5f9' }}>
              <strong>Name:</strong> {childDetails.name}
            </Typography>
            <Typography sx={{ color: '#f1f5f9' }}>
              <strong>Class:</strong> {childDetails.className} - {childDetails.section}
            </Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Box sx={formControlStyle}>
          <label htmlFor="examType" style={labelStyle}>Exam Type</label>
          <FormControl fullWidth>
            <Select
              id="examType"
              value={examType}
              onChange={handleExamTypeChange}
              displayEmpty
              sx={{
                backgroundColor: '#1e293b',
                color: '#f1f5f9',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#475569',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#64748b',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                },
                '& .MuiSvgIcon-root': {
                  color: '#f1f5f9',
                },
              }}
            >
              <MenuItem value="">
                <em>Select Exam Type</em>
              </MenuItem>
              {examTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={formControlStyle}>
          <label htmlFor="subject" style={labelStyle}>Subject</label>
          <FormControl fullWidth>
            <Select
              id="subject"
              value={subject}
              onChange={handleSubjectChange}
              displayEmpty
              sx={{
                backgroundColor: '#1e293b',
                color: '#f1f5f9',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#475569',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#64748b',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                },
                '& .MuiSvgIcon-root': {
                  color: '#f1f5f9',
                },
              }}
            >
              <MenuItem value="">
                <em>Select Subject</em>
              </MenuItem>
              {subjects.map((subj) => (
                <MenuItem key={subj} value={subj}>{subj}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Button
          onClick={handleSearch}
          variant="contained"
          sx={{
            backgroundColor: '#3b82f6',
            color: '#f1f5f9',
            padding: '8px 16px',
            height: '40px',
            '&:hover': {
              backgroundColor: '#2563eb',
            },
          }}
        >
          Search
        </Button>
      </Box>

      {filteredMarks && filteredMarks.length > 0 ? (
        <Box sx={{ marginBottom: '24px', padding: '16px', backgroundColor: '#1e293b', borderRadius: '8px' }}>
          <Typography variant="h6" sx={{ color: '#f1f5f9', marginBottom: '8px' }}>
            Search Results
          </Typography>
          <table style={{ width: '100%', color: '#f1f5f9', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #475569', padding: '8px' }}>Subject</th>
                <th style={{ border: '1px solid #475569', padding: '8px' }}>Exam Type</th>
                <th style={{ border: '1px solid #475569', padding: '8px' }}>Marks</th>
                <th style={{ border: '1px solid #475569', padding: '8px' }}>Maximum Marks</th>
                <th style={{ border: '1px solid #475569', padding: '8px' }}>Percentage</th>
                <th style={{ border: '1px solid #475569', padding: '8px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredMarks.map((record, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.subject}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.examType}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.value}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.maxMarks}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>
                    {calculatePercentage(record.value, record.maxMarks)}%
                  </td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{formatDate(record.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      ) : filteredMarks && filteredMarks.length === 0 ? (
        <Box sx={{ marginBottom: '24px', padding: '16px', backgroundColor: '#1e293b', borderRadius: '8px' }}>
          <Typography sx={{ color: '#f1f5f9' }}>
            No marks records found for the selected criteria.
          </Typography>
        </Box>
      ) : null}

      <Typography variant="h5" sx={{ color: '#f1f5f9', marginBottom: '16px', marginTop: '16px' }}>
        All Academic Records
      </Typography>

      <Box sx={{ marginBottom: '16px', overflowX: 'auto' }}>
        <table style={{ width: '100%', color: '#f1f5f9', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Subject</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Exam Type</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Marks</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Maximum Marks</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Percentage</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {marksRecords.length > 0 ? (
              marksRecords.map((record, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.subject}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.examType}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.value}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.maxMarks}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>
                    {calculatePercentage(record.value, record.maxMarks)}%
                  </td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{formatDate(record.date)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ border: '1px solid #475569', padding: '8px', textAlign: 'center' }}>
                  No marks records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

export default Marks;