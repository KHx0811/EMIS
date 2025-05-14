import React, { useState, useEffect } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '@/assets/config';

const { url } = config;

const Teachers = () => {
  const navigate = useNavigate();
  const [childDetails, setChildDetails] = useState(null);
  const [teachersData, setTeachersData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChildDetails();
  }, [navigate]);

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
      fetchChildTeachers(response.data.data.student_id);
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

  const fetchChildTeachers = async (studentId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('parentToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/parent');
        return;
      }

      const response = await axios.get(`${url}/api/parents/child-teachers/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setTeachersData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching teachers data:', error);
      alert('Error fetching teachers data. Please try again.');
    } finally {
      setLoading(false);
    }
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
        Child's Teachers
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

      <Typography variant="h5" sx={{ color: '#f1f5f9', marginBottom: '16px', marginTop: '16px' }}>
        Teachers Information
      </Typography>

      {loading ? (
        <Box sx={{ marginBottom: '24px', padding: '16px', backgroundColor: '#1e293b', borderRadius: '8px', textAlign: 'center' }}>
          <Typography sx={{ color: '#f1f5f9' }}>Loading teachers information...</Typography>
        </Box>
      ) : teachersData.length > 0 ? (
        <>
        <Box sx={{ marginBottom: '16px', padding: '16px', backgroundColor: '#1e293b', borderRadius: '8px' }}>
          <Typography sx={{ color: '#f1f5f9' }}>
            <strong>Total Teachers:</strong> {new Set(teachersData.map(teacher => teacher.teacherId)).size}
          </Typography>
          <Typography sx={{ color: '#f1f5f9', marginTop: '8px' }}>
            <strong>Total Classes:</strong> {teachersData.length}
          </Typography>
        </Box>
        <Box sx={{ marginBottom: '16px', overflowX: 'auto', display: { xs: 'none', md: 'block' } }}>
          <table style={{ width: '100%', color: '#f1f5f9', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #475569', padding: '8px' }}>Teacher Name</th>
                <th style={{ border: '1px solid #475569', padding: '8px' }}>Subject</th>
                <th style={{ border: '1px solid #475569', padding: '8px' }}>Class</th>
                <th style={{ border: '1px solid #475569', padding: '8px' }}>Section</th>
                <th style={{ border: '1px solid #475569', padding: '8px' }}>Qualification</th>
              </tr>
            </thead>
            <tbody>
              {teachersData.map((teacher, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{teacher.teacherName}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>
                    {teacher.class_code.split('')[0] === 'C' ? 'Computer Science' :
                     teacher.class_code.split('')[0] === 'M' ? 'Mathematics' :
                     teacher.class_code.split('')[0] === 'E' ? 'English' :
                     teacher.class_code.split('')[0] === 'S' ? 'Science' :
                     teacher.class_code.split('')[0] === 'H' ? 'History' : 'Other'}
                  </td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{teacher.className}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{teacher.section}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{teacher.qualification}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
        
        <Box sx={{ display: { xs: 'block', md: 'none' }, marginBottom: '16px' }}>
          {Array.from(new Set(teachersData.map(t => t.teacherId))).map((teacherId) => {
            const teacherClasses = teachersData.filter(t => t.teacherId === teacherId);
            const teacher = teacherClasses[0];
            
            return (
              <Accordion 
                key={teacherId} 
                sx={{ 
                  backgroundColor: '#1e293b',
                  color: '#f1f5f9',
                  marginBottom: '8px',
                  '&:before': {
                    display: 'none',
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: '#f1f5f9' }} />}
                  sx={{ borderBottom: '1px solid #475569' }}
                >
                  <Typography sx={{ fontWeight: 'bold' }}>{teacher.teacherName}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ marginBottom: '8px' }}>
                    <strong>Qualification:</strong> {teacher.qualification}
                  </Typography>
                  
                  <Typography sx={{ marginBottom: '8px', fontWeight: 'bold' }}>Classes:</Typography>
                  
                  {teacherClasses.map((cls, idx) => (
                    <Box 
                      key={idx} 
                      sx={{ 
                        padding: '8px', 
                        backgroundColor: '#0f172a', 
                        borderRadius: '4px',
                        marginBottom: '8px'
                      }}
                    >
                      <Typography>
                        <strong>Class:</strong> {cls.className} - {cls.section}
                      </Typography>
                      <Typography>
                        <strong>Subject:</strong> {
                          cls.class_code.split('')[0] === 'C' ? 'Computer Science' :
                          cls.class_code.split('')[0] === 'M' ? 'Mathematics' :
                          cls.class_code.split('')[0] === 'E' ? 'English' :
                          cls.class_code.split('')[0] === 'S' ? 'Science' :
                          cls.class_code.split('')[0] === 'H' ? 'History' : 'Other'
                        }
                      </Typography>
                      <Typography>
                        <strong>Class Code:</strong> {cls.class_code}
                      </Typography>
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </>) : (
        <Box sx={{ marginBottom: '24px', padding: '16px', backgroundColor: '#1e293b', borderRadius: '8px' }}>
          <Typography sx={{ color: '#f1f5f9' }}>
            No teachers found for this student.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Teachers;