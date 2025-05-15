import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, FormControl, Select, MenuItem } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle, formControlStyle } from '../Admin/Student/formStyles.js';

const url = import.meta.env.URL;


const PTMeetings = () => {
  const navigate = useNavigate();
  const [childDetails, setChildDetails] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [filteredInteractions, setFilteredInteractions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [interactionType, setInteractionType] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [interactionTypes] = useState([
    'Email', 'Phone', 'Meeting', 'Message'
  ]);

  useEffect(() => {
    fetchChildDetails();
  }, [navigate]);

  useEffect(() => {
    if (interactions.length > 0) {
      const uniqueTeachers = [...new Set(interactions.map(record => record.teacherId))];
      const teacherList = uniqueTeachers.map(id => {
        const teacherRecord = interactions.find(record => record.teacherId === id);
        return {
          id: teacherRecord.teacherId,
          name: teacherRecord.teacherName
        };
      });
      setTeachers(teacherList);
    }
  }, [interactions]);

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
      fetchInteractions();
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

  const fetchInteractions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('parentToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/parent');
        return;
      }

      const response = await axios.get(`${url}/api/parents/interactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setInteractions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching parent-teacher interactions:', error);
      alert('Error fetching interaction records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInteractionTypeChange = (e) => {
    setInteractionType(e.target.value);
  };

  const handleTeacherChange = (e) => {
    setTeacherId(e.target.value);
  };

  const handleSearch = () => {
    if (!interactionType && !teacherId) {
      alert('Please select at least one filter (Interaction Type or Teacher).');
      return;
    }

    let filtered = [...interactions];
    
    if (interactionType) {
      filtered = filtered.filter(record => record.interactionType === interactionType);
    }
    
    if (teacherId) {
      filtered = filtered.filter(record => record.teacherId === teacherId);
    }

    setFilteredInteractions(filtered);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
        Parent-Teacher Interactions
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
          <label htmlFor="interactionType" style={labelStyle}>Interaction Type</label>
          <FormControl fullWidth>
            <Select
              id="interactionType"
              value={interactionType}
              onChange={handleInteractionTypeChange}
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
                <em>Select Interaction Type</em>
              </MenuItem>
              {interactionTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={formControlStyle}>
          <label htmlFor="teacher" style={labelStyle}>Teacher</label>
          <FormControl fullWidth>
            <Select
              id="teacher"
              value={teacherId}
              onChange={handleTeacherChange}
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
                <em>Select Teacher</em>
              </MenuItem>
              {teachers.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>{teacher.name}</MenuItem>
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

      {filteredInteractions && filteredInteractions.length > 0 ? (
        <Box sx={{ marginBottom: '24px', padding: '16px', backgroundColor: '#1e293b', borderRadius: '8px' }}>
          <Typography variant="h6" sx={{ color: '#f1f5f9', marginBottom: '8px' }}>
            Search Results
          </Typography>
          <table style={{ width: '100%', color: '#f1f5f9', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #475569', padding: '8px' }}>Teacher</th>
                <th style={{ border: '1px solid #475569', padding: '8px' }}>Student</th>
                <th style={{ border: '1px solid #475569', padding: '8px' }}>Type</th>
                <th style={{ border: '1px solid #475569', padding: '8px' }}>Content</th>
                <th style={{ border: '1px solid #475569', padding: '8px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredInteractions.map((record, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.teacherName}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.studentName}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>
                    <Box 
                      sx={{ 
                        display: 'inline-block',
                        backgroundColor: getInteractionColor(record.interactionType),
                        color: '#ffffff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 'medium',
                        fontSize: '0.875rem',
                      }}
                    >
                      {record.interactionType}
                    </Box>
                  </td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.content}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{formatDate(record.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      ) : filteredInteractions && filteredInteractions.length === 0 ? (
        <Box sx={{ marginBottom: '24px', padding: '16px', backgroundColor: '#1e293b', borderRadius: '8px' }}>
          <Typography sx={{ color: '#f1f5f9' }}>
            No interaction records found for the selected criteria.
          </Typography>
        </Box>
      ) : null}

      <Typography variant="h5" sx={{ color: '#f1f5f9', marginBottom: '16px', marginTop: '16px' }}>
        All Interaction Records
      </Typography>

      <Box sx={{ marginBottom: '16px', overflowX: 'auto' }}>
        <table style={{ width: '100%', color: '#f1f5f9', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Teacher</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Student</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Type</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Content</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {interactions.length > 0 ? (
              interactions.map((record, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.teacherName}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.studentName}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>
                    <Box 
                      sx={{ 
                        display: 'inline-block',
                        backgroundColor: getInteractionColor(record.interactionType),
                        color: '#ffffff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 'medium',
                        fontSize: '0.875rem',
                      }}
                    >
                      {record.interactionType}
                    </Box>
                  </td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.content}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{formatDate(record.date)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ border: '1px solid #475569', padding: '8px', textAlign: 'center' }}>
                  No interaction records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

const getInteractionColor = (type) => {
  switch(type) {
    case 'Phone': return '#3b82f6';
    case 'Meeting': return '#10b981';
    case 'Email': return '#8b5cf6';
    case 'Message': return '#f59e0b';
    default: return '#6b7280';
  }
};

export default PTMeetings;