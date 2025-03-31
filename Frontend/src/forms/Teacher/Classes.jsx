import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Checkbox, FormControlLabel, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Classes = () => {
  const navigate = useNavigate();
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showCreateClassForm, setShowCreateClassForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teacherDetails, setTeacherDetails] = useState(null);

  useEffect(() => {
    fetchClasses();
    fetchTeacherDetails();
  }, []);

  const fetchTeacherDetails = async () => {
    try {
      const token = localStorage.getItem('teacherToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/teacher');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/teachers/details', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setTeacherDetails(response.data.data);
    } catch (error) {
      console.error('Error fetching teacher details:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('teacherToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/teacher');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/teachers/classes', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setClasses(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching classes:', error);
      alert('Error fetching classes. Please try again.');
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('teacherToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/teacher');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/teachers/all-students', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setStudents(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Error fetching students. Please try again.');
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!className || !section) {
      alert('Please enter class name and section');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('teacherToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/teacher');
        return;
      }

      const payload = {
        className,
        section,
        students: selectedStudents
      };

      // Single API call to create class with students
      await axios.post('http://localhost:3000/api/teachers/create-class', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert('Class created successfully');
      setClassName('');
      setSection('');
      setSelectedStudents([]);
      setShowCreateClassForm(false);
      fetchClasses();
      setLoading(false);
    } catch (error) {
      console.error('Error creating class:', error);
      alert(`Error creating class: ${error.response?.data?.message || 'Please try again'}`);
      setLoading(false);
    }
  };

  const handleStudentSelection = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0f172a',
        padding: '24px',
        borderRadius: '8px',
        minHeight: '80vh'
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
        Manage Classes
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress sx={{ color: '#3b82f6' }} />
        </Box>
      ) : (
        <>
          {/* Display existing classes or a message if none exist */}
          {classes.length > 0 ? (
            <Box sx={{ marginBottom: '24px' }}>
              <Typography sx={{ color: '#f1f5f9', marginBottom: '16px', fontSize: '1.25rem' }}>Your Classes:</Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                gap: '16px' 
              }}>
                {classes.map((cls, index) => (
                  <Box
                    key={index}
                    sx={{
                      backgroundColor: '#1F2A40',
                      padding: '16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                      }
                    }}
                    onClick={() => navigate(`/class-details/${cls._id}`)}
                  >
                    <Typography sx={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {cls.className}
                    </Typography>
                    <Typography sx={{ color: '#94a3b8' }}>Section: {cls.section}</Typography>
                    {cls.students && (
                      <Typography sx={{ color: '#94a3b8', marginTop: '8px' }}>
                        Students: {cls.students.length || 0}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <Box sx={{ 
              backgroundColor: '#1F2A40', 
              padding: '24px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <Typography sx={{ color: '#f1f5f9', marginBottom: '16px' }}>
                No classes found. Please create a new class.
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setShowCreateClassForm(true);
                  fetchStudents();
                }}
                sx={{
                  backgroundColor: '#3b82f6',
                  color: '#f1f5f9',
                  '&:hover': { backgroundColor: '#2563eb' }
                }}
              >
                Create Class
              </Button>
            </Box>
          )}

          {/* Button to show create class form (only show if classes exist and form is not shown) */}
          {classes.length > 0 && !showCreateClassForm && (
            <Button
              variant="contained"
              onClick={() => {
                setShowCreateClassForm(true);
                fetchStudents();
              }}
              sx={{
                backgroundColor: '#3b82f6',
                color: '#f1f5f9',
                marginBottom: '16px',
                '&:hover': { backgroundColor: '#2563eb' },
                alignSelf: 'flex-start'
              }}
            >
              Create Class
            </Button>
          )}

          {/* Create class form */}
          {showCreateClassForm && (
            <Box
              sx={{
                backgroundColor: '#1F2A40',
                padding: '24px',
                borderRadius: '8px',
                marginBottom: '24px'
              }}
            >
              <Typography sx={{ color: '#f1f5f9', marginBottom: '16px', fontSize: '1.25rem' }}>
                Create New Class
              </Typography>

              <Box sx={{ marginBottom: '16px' }}>
                <label style={{ color: '#f1f5f9', display: 'block', marginBottom: '8px' }} htmlFor="className">
                  Class Name *
                </label>
                <TextField
                  id="className"
                  name="className"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  required
                  fullWidth
                  sx={{
                    input: { color: '#f1f5f9' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#475569' },
                      '&:hover fieldset': { borderColor: '#64748b' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                    }
                  }}
                />
              </Box>

              <Box sx={{ marginBottom: '16px' }}>
                <label style={{ color: '#f1f5f9', display: 'block', marginBottom: '8px' }} htmlFor="section">
                  Section *
                </label>
                <TextField
                  id="section"
                  name="section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  required
                  fullWidth
                  sx={{
                    input: { color: '#f1f5f9' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#475569' },
                      '&:hover fieldset': { borderColor: '#64748b' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                    }
                  }}
                />
              </Box>

              <Box sx={{ marginBottom: '16px' }}>
                <Typography sx={{ color: '#f1f5f9', marginBottom: '16px' }}>Select Students:</Typography>
                {students.length > 0 ? (
                  <Box 
                    sx={{ 
                      maxHeight: '300px', 
                      overflowY: 'auto',
                      padding: '8px',
                      border: '1px solid #475569',
                      borderRadius: '4px'
                    }}
                  >
                    {students.map((student) => (
                      <FormControlLabel
                        key={student.student_id}
                        control={
                          <Checkbox
                            checked={selectedStudents.includes(student.student_id)}
                            onChange={() => handleStudentSelection(student.student_id)}
                            sx={{ 
                              color: '#94a3b8',
                              '&.Mui-checked': {
                                color: '#3b82f6',
                              },
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography sx={{ color: '#f1f5f9' }}>{student.name}</Typography>
                            <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                              ID: {student.student_id} {student.grade && `• Grade: ${student.grade}`}
                            </Typography>
                          </Box>
                        }
                        sx={{ 
                          display: 'block', 
                          marginBottom: '8px',
                          padding: '4px',
                          borderRadius: '4px',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)'
                          }
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                    No students found. Students will be available once added to the system.
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: '16px' }}>
                <Button
                  variant="contained"
                  onClick={handleCreateClass}
                  disabled={loading}
                  sx={{
                    backgroundColor: '#3b82f6',
                    color: '#f1f5f9',
                    '&:hover': { backgroundColor: '#2563eb' }
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: '#f1f5f9' }} /> : 'Create Class'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowCreateClassForm(false)}
                  sx={{
                    color: '#f1f5f9',
                    borderColor: '#475569',
                    '&:hover': { borderColor: '#64748b', backgroundColor: 'rgba(255, 255, 255, 0.05)' }
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Classes;