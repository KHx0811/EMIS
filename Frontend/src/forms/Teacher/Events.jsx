import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Snackbar, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CalendarToday, LocationOn, Category, Delete as DeleteIcon, Edit as EditIcon, AccessTime as AccessTimeIcon } from '@mui/icons-material';

const TeacherEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [participationType, setParticipationType] = useState('');
  const [skillGroup, setSkillGroup] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [registrations, setRegistrations] = useState([]);
  const [showRegistrations, setShowRegistrations] = useState(false);

  // Form styles
  const inputStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#293B55',
    color: '#f1f5f9',
    border: '1px solid #475569',
    borderRadius: '4px',
    fontSize: '0.9rem',
    marginBottom: '8px',
    outline: 'none',
  };

  const labelStyle = {
    color: '#94a3b8',
    marginBottom: '8px',
    display: 'block',
    fontSize: '0.9rem',
  };

  const selectStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#293B55',
    color: '#f1f5f9',
    border: '1px solid #475569',
    borderRadius: '4px',
    fontSize: '0.9rem',
    marginBottom: '8px',
    outline: 'none',
  };

  const getEventTypeColor = (type) => {
    const colors = {
      'Academic': '#3b82f6',
      'Cultural': '#8b5cf6',
      'Sports': '#10b981',
      'Festival': '#f59e0b',
      'Competition': '#ef4444',
      'Workshop': '#6366f1',
      'Parent-Teacher Meeting': '#ec4899',
      'Other': '#64748b'
    };
    return colors[type] || colors['Other'];
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('teacherToken');
        if (!token) {
          setSnackbar({
            open: true,
            message: 'You are not logged in. Please login to continue.',
            severity: 'error'
          });
          navigate('/login/teacher');
          return;
        }

        const response = await axios.get('http://localhost:3000/api/teachers/school-events', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setEvents(response.data.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setSnackbar({
          open: true,
          message: 'Error fetching events. Please try again.',
          severity: 'error'
        });
      }
    };

    fetchEvents();
  }, [navigate]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('teacherToken');
      if (!token) return;

      const response = await axios.get('http://localhost:3000/api/teachers/classes', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setClasses(response.data.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error fetching classes. Please try again.',
        severity: 'error'
      });
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const token = localStorage.getItem('teacherToken');
      if (!token) return;

      const response = await axios.get(`http://localhost:3000/api/teachers/classes/${classId}/students`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setStudents(response.data.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error fetching students. Please try again.',
        severity: 'error'
      });
    }
  };

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('teacherToken');
      if (!token) return;

      const response = await axios.get('http://localhost:3000/api/teachers/event-registrations', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setRegistrations(response.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Error fetching registrations. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleOpenDialog = (event) => {
    setSelectedEvent(event);
    fetchClasses();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClass('');
    setSelectedStudent('');
    setParticipationType('');
    setSkillGroup('');
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    fetchStudents(classId);
  };

  const handleRegisterStudent = async () => {
    try {
      if (!selectedEvent || !selectedClass || !selectedStudent || !participationType || !skillGroup) {
        setSnackbar({
          open: true,
          message: 'All fields are required',
          severity: 'error'
        });
        return;
      }

      const token = localStorage.getItem('teacherToken');
      if (!token) return;

      const response = await axios.post(
        'http://localhost:3000/api/teachers/register-event',
        {
          eventId: selectedEvent._id,
          classId: selectedClass,
          studentId: selectedStudent,
          participationType,
          skillGroup
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSnackbar({
        open: true,
        message: 'Student registered successfully!',
        severity: 'success'
      });
      
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error registering student. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCancelRegistration = async (registrationId) => {
    try {
      const token = localStorage.getItem('teacherToken');
      if (!token) return;

      await axios.put(
        `http://localhost:3000/api/teachers/event-registrations/${registrationId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSnackbar({
        open: true,
        message: 'Registration cancelled successfully!',
        severity: 'success'
      });
      
      fetchRegistrations();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error cancelling registration. Please try again.',
        severity: 'error'
      });
    }
  };

  const toggleView = () => {
    if (!showRegistrations) {
      fetchRegistrations();
    }
    setShowRegistrations(!showRegistrations);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
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
          {showRegistrations ? 'Student Event Registrations' : 'School Events'}
        </Typography>
        <Button 
          variant="outlined" 
          onClick={toggleView}
          sx={{
            color: '#f1f5f9',
            borderColor: '#475569',
            '&:hover': { borderColor: '#64748b', backgroundColor: 'rgba(255, 255, 255, 0.05)' }
          }}
        >
          {showRegistrations ? 'View Events' : 'View Registrations'}
        </Button>
      </Box>

      {snackbar.open && (
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            marginBottom: '16px', 
            backgroundColor: snackbar.severity === 'error' ? '#321b1b' : '#1b3225', 
            color: snackbar.severity === 'error' ? '#f87171' : '#6ee7b7' 
          }} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: '#3b82f6' }} />
        </Box>
      ) : showRegistrations ? (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '16px' 
        }}>
          {registrations.length > 0 ? (
            registrations.map((registration) => (
              <Box
                key={registration._id}
                sx={{
                  backgroundColor: '#1F2A40',
                  padding: '16px',
                  borderRadius: '8px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  borderLeft: `4px solid ${
                    registration.status === 'Registered' ? '#10b981' : 
                    registration.status === 'Withdrawn' ? '#ef4444' : '#3b82f6'
                  }`,
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                  }
                }}
              >
                <Typography sx={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px' }}>
                  {registration.event_id.eventName}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <CalendarToday sx={{ color: '#94a3b8', fontSize: '1rem' }} />
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    {formatDate(registration.event_id.eventDate)}
                  </Typography>
                </Box>

                <Typography sx={{ color: '#f1f5f9', marginBottom: '4px', fontSize: '0.9rem' }}>
                  <strong>Student ID:</strong> {registration.student_id}
                </Typography>
                <Typography sx={{ color: '#f1f5f9', marginBottom: '4px', fontSize: '0.9rem' }}>
                  <strong>Class:</strong> {registration.class_id.className} {registration.class_id.section}
                </Typography>
                <Typography sx={{ color: '#f1f5f9', marginBottom: '4px', fontSize: '0.9rem' }}>
                  <strong>Participation:</strong> {registration.participation_type}
                </Typography>
                <Typography sx={{ color: '#f1f5f9', marginBottom: '4px', fontSize: '0.9rem' }}>
                  <strong>Skill/Group:</strong> {registration.skill_group}
                </Typography>
                
                <Box sx={{ 
                  display: 'inline-block',
                  bgcolor: registration.status === 'Registered' ? '#10b981' : 
                          registration.status === 'Withdrawn' ? '#ef4444' : '#3b82f6',
                  color: 'white',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  marginTop: '8px',
                  marginBottom: '8px'
                }}>
                  {registration.status}
                </Box>
                
                {registration.status === 'Registered' && (
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small" 
                    sx={{ 
                      mt: 2, 
                      color: '#ef4444',
                      borderColor: '#ef4444',
                      '&:hover': { 
                        borderColor: '#b91c1c',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)'
                      } 
                    }}
                    onClick={() => handleCancelRegistration(registration._id)}
                  >
                    Cancel Registration
                  </Button>
                )}
              </Box>
            ))
          ) : (
            <Box sx={{ 
              backgroundColor: '#1F2A40', 
              padding: '24px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              textAlign: 'center',
              gridColumn: '1 / -1'
            }}>
              <Typography sx={{ color: '#f1f5f9', marginBottom: '16px' }}>
                No registrations found
              </Typography>
              <Button
                variant="contained"
                onClick={toggleView}
                sx={{
                  backgroundColor: '#3b82f6',
                  color: '#f1f5f9',
                  '&:hover': { backgroundColor: '#2563eb' }
                }}
              >
                View Events
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '16px' 
        }}>
          {events.length > 0 ? (
            events.map((event) => (
              <Box
                key={event._id}
                sx={{
                  backgroundColor: '#1F2A40',
                  padding: '16px',
                  borderRadius: '8px',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  borderLeft: `4px solid ${getEventTypeColor(event.eventType)}`,
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                  }
                }}
                onClick={() => handleOpenDialog(event)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Box sx={{ 
                    bgcolor: getEventTypeColor(event.eventType),
                    color: 'white',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {event.eventType}
                  </Box>
                </Box>

                <Typography sx={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px' }}>
                  {event.eventName}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <CalendarToday sx={{ color: '#94a3b8', fontSize: '1rem' }} />
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    {formatDate(event.eventDate)}
                  </Typography>
                </Box>

                {event.eventTime && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <AccessTimeIcon sx={{ color: '#94a3b8', fontSize: '1rem' }} />
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                      {event.eventTime}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <LocationOn sx={{ color: '#94a3b8', fontSize: '1rem' }} />
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    {event.eventLocation}
                  </Typography>
                </Box>

                {event.eventDescription && (
                  <Typography sx={{ color: '#94a3b8', marginTop: '8px', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    {event.eventDescription.length > 100 ? 
                      `${event.eventDescription.substring(0, 100)}...` : 
                      event.eventDescription}
                  </Typography>
                )}
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  sx={{
                    mt: 2,
                    backgroundColor: '#3b82f6',
                    color: '#f1f5f9',
                    '&:hover': { backgroundColor: '#2563eb' }
                  }}
                >
                  Register Students
                </Button>
              </Box>
            ))
          ) : (
            <Box sx={{ 
              backgroundColor: '#1F2A40', 
              padding: '24px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              textAlign: 'center',
              gridColumn: '1 / -1'
            }}>
              <Typography sx={{ color: '#f1f5f9', marginBottom: '16px' }}>
                No events found
              </Typography>
            </Box>
          )}
        </Box>
      )}

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: '#1F2A40',
            color: '#f1f5f9',
            border: '1px solid #475569',
          },
        }}
      >
        <DialogTitle sx={{ color: '#f1f5f9' }}>
          Register Student for {selectedEvent?.eventName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <label style={labelStyle} htmlFor="class-select">Select Class</label>
            <select
              id="class-select"
              value={selectedClass}
              onChange={handleClassChange}
              style={selectStyle}
            >
              <option value="" disabled>Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className} {cls.section}
                </option>
              ))}
            </select>

            <label style={labelStyle} htmlFor="student-select">Select Student</label>
            <select
              id="student-select"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              disabled={!selectedClass}
              style={selectStyle}
            >
              <option value="" disabled>Select Student</option>
              {students.map((student) => (
                <option key={student._id} value={student.student_id}>
                  {student.name} ({student.student_id})
                </option>
              ))}
            </select>

            <label style={labelStyle} htmlFor="participation-type">Participation Type</label>
            <select
              id="participation-type"
              value={participationType}
              onChange={(e) => setParticipationType(e.target.value)}
              style={selectStyle}
            >
              <option value="" disabled>Select Participation Type</option>
              <option value="Individual">Individual</option>
              <option value="Group">Group</option>
              <option value="Team">Team</option>
              <option value="Class">Class</option>
            </select>

            <label style={labelStyle} htmlFor="skill-group">Skill/Group Name</label>
            <input
              id="skill-group"
              value={skillGroup}
              onChange={(e) => setSkillGroup(e.target.value)}
              placeholder="Enter skill name or group/team name"
              style={inputStyle}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog}
            sx={{ color: '#94a3b8' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRegisterStudent} 
            variant="contained" 
            sx={{
              backgroundColor: '#3b82f6',
              color: '#f1f5f9',
              '&:hover': { backgroundColor: '#2563eb' }
            }}
          >
            Register
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            backgroundColor: snackbar.severity === 'error' ? '#321b1b' : '#1b3225', 
            color: snackbar.severity === 'error' ? '#f87171' : '#6ee7b7' 
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherEvents;