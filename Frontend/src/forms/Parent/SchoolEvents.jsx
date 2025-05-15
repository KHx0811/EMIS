import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, Snackbar, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CalendarToday, LocationOn, AccessTime as AccessTimeIcon } from '@mui/icons-material';

const url = import.meta.env.URL;

const SchoolEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [registrations, setRegistrations] = useState([]);
  const [showRegistrations, setShowRegistrations] = useState(false);

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
        const token = localStorage.getItem('parentToken');
        if (!token) {
          setSnackbar({
            open: true,
            message: 'You are not logged in. Please login to continue.',
            severity: 'error'
          });
          navigate('/login/parent');
          return;
        }

        const response = await axios.get(`${url}/api/parents/school-events`, {
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

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('parentToken');
      if (!token) return;

      const response = await axios.get(`${url}/api/parents/event-registrations`, {
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
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
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
          {showRegistrations ? 'My Child\'s Event Participations' : 'School Events'}
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
          {showRegistrations ? 'View All Events' : 'View My Child\'s Events'}
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

                {registration.event_id.eventTime && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <AccessTimeIcon sx={{ color: '#94a3b8', fontSize: '1rem' }} />
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                      {registration.event_id.eventTime}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <LocationOn sx={{ color: '#94a3b8', fontSize: '1rem' }} />
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    {registration.event_id.eventLocation}
                  </Typography>
                </Box>

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
                Your child is not registered for any events yet
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
                View School Events
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
          Event Details: {selectedEvent?.eventName}
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ color: '#f1f5f9', mb: 2 }}>
                <strong>Date:</strong> {formatDate(selectedEvent.eventDate)}
              </Typography>
              {selectedEvent.eventTime && (
                <Typography sx={{ color: '#f1f5f9', mb: 2 }}>
                  <strong>Time:</strong> {selectedEvent.eventTime}
                </Typography>
              )}
              <Typography sx={{ color: '#f1f5f9', mb: 2 }}>
                <strong>Location:</strong> {selectedEvent.eventLocation}
              </Typography>
              <Typography sx={{ color: '#f1f5f9', mb: 2 }}>
                <strong>Type:</strong> {selectedEvent.eventType}
              </Typography>
              <Typography sx={{ color: '#f1f5f9', mb: 2 }}>
                <strong>Description:</strong> {selectedEvent.eventDescription}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog}
            sx={{ color: '#94a3b8' }}
          >
            Close
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

export default SchoolEvents;