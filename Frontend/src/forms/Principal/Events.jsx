import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Select, MenuItem, TextField, CircularProgress, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle, formControlStyle, selectStyle } from '../Admin/Student/formStyles';
import config from '@/assets/config';

const { url } = config;

const EventsManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    eventName: '',
    eventDescription: '',
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    eventType: ''
  });

  const eventTypes = [
    'Academic',
    'Cultural',
    'Sports',
    'Festival',
    'Competition',
    'Workshop',
    'Parent-Teacher Meeting',
    'Other',
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('principalToken');
      if (!token) {
        setError('You are not logged in. Please login to continue.');
        navigate('/login/principal');
        return;
      }

      const response = await axios.get(`${url}/api/schools/events`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setEvents(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Error fetching events. Please try again.');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      eventName: '',
      eventDescription: '',
      eventDate: '',
      eventTime: '',
      eventLocation: '',
      eventType: ''
    });
    setEditMode(false);
    setCurrentEventId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.eventName || !formData.eventDate || !formData.eventLocation || !formData.eventType) {
      setError('Event name, date, location, and type are required.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('principalToken');
      if (!token) {
        setError('You are not logged in. Please login to continue.');
        navigate('/login/principal');
        return;
      }

      const payload = { 
        eventName: formData.eventName,
        eventDescription: formData.eventDescription,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        eventLocation: formData.eventLocation,
        eventType: formData.eventType
      };

      if (editMode && currentEventId) {
        await axios.put(`${url}/api/schools/event/${currentEventId}`, payload, {
          headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          },
        });
        setSuccess('Event updated successfully');
      } else {
        await axios.post(`${url}/api/schools/create-event`, payload, {
          headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          },
        });
        setSuccess('Event created successfully');
      }
      
      resetForm();
      setShowCreateForm(false);
      fetchEvents();
    } catch (error) {
      console.error('Error with event:', error);
      setError(`Error: ${error.response?.data?.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event) => {
    setFormData({
      eventName: event.eventName,
      eventDescription: event.eventDescription || '',
      eventDate: new Date(event.eventDate).toISOString().split('T')[0],
      eventTime: event.eventTime || '',
      eventLocation: event.eventLocation,
      eventType: event.eventType
    });
    
    setCurrentEventId(event._id);
    setEditMode(true);
    setShowCreateForm(true);
  };

  const handleDeleteClick = (e, event) => {
    e.stopPropagation();
    setEventToDelete(event);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteEvent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('principalToken');
      if (!token) {
        setError('You are not logged in. Please login to continue.');
        navigate('/login/principal');
        return;
      }

      await axios.delete(`${url}/api/schools/event/${eventToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess('Event deleted successfully!');
      setDeleteConfirmOpen(false);
      setEventToDelete(null);
      fetchEvents();
      
      if (editMode && currentEventId === eventToDelete._id) {
        resetForm();
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setError(error.response?.data?.message || 'Error deleting event. Please try again.');
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
    }
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
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
        Manage School Events
      </Typography>

      {error && (
        <Alert severity="error" sx={{ marginBottom: '16px', backgroundColor: '#321b1b', color: '#f87171' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ marginBottom: '16px', backgroundColor: '#1b3225', color: '#6ee7b7' }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {loading && !showCreateForm ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress sx={{ color: '#3b82f6' }} />
        </Box>
      ) : (
        <>
          <Box sx={{ marginBottom: '24px' }}>
            <Typography sx={{ color: '#f1f5f9', marginBottom: '16px', fontSize: '1.25rem' }}>School Events:</Typography>
            
            {events.length > 0 ? (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '16px' 
              }}>
                {events.map((event) => (
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
                    onClick={() => handleEventClick(event)}
                  >
                    <DeleteIcon 
                      sx={{ 
                        position: 'absolute', 
                        top: '16px', 
                        right: '16px', 
                        color: '#ef4444',
                        cursor: 'pointer',
                        '&:hover': { color: '#b91c1c' }
                      }} 
                      onClick={(e) => handleDeleteClick(e, event)}
                    />
                    
                    <EditIcon
                      sx={{ 
                        position: 'absolute', 
                        top: '16px', 
                        right: '48px', 
                        color: '#3b82f6',
                        cursor: 'pointer',
                        '&:hover': { color: '#2563eb' }
                      }} 
                    />
                    
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

                    <Typography sx={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '1.1rem', paddingRight: '80px', marginBottom: '8px' }}>
                      {event.eventName}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <CalendarMonthIcon sx={{ color: '#94a3b8', fontSize: '1rem' }} />
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
                      <LocationOnIcon sx={{ color: '#94a3b8', fontSize: '1rem' }} />
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        {event.eventLocation}
                      </Typography>
                    </Box>

                    {event.eventDescription && (
                      <Typography sx={{ color: '#94a3b8', marginTop: '8px', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        {event.eventDescription.length > 100 ? `${event.eventDescription.substring(0, 100)}...` : event.eventDescription}
                      </Typography>
                    )}
                  </Box>
                ))}
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
                  No events found. Create a new school event.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setShowCreateForm(true)}
                  sx={{
                    backgroundColor: '#3b82f6',
                    color: '#f1f5f9',
                    '&:hover': { backgroundColor: '#2563eb' }
                  }}
                >
                  Create Event
                </Button>
              </Box>
            )}
          </Box>

          {events.length > 0 && !showCreateForm && (
            <Button
              variant="contained"
              onClick={() => {
                setShowCreateForm(true);
                resetForm();
              }}
              sx={{
                backgroundColor: '#3b82f6',
                color: '#f1f5f9',
                marginBottom: '16px',
                '&:hover': { backgroundColor: '#2563eb' },
                alignSelf: 'flex-start'
              }}
            >
              Create New Event
            </Button>
          )}

          {showCreateForm && (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                backgroundColor: '#1F2A40',
                padding: '24px',
                borderRadius: '8px',
                marginBottom: '24px'
              }}
            >
              <Typography sx={{ color: '#f1f5f9', marginBottom: '16px', fontSize: '1.25rem' }}>
                {editMode ? 'Update Event' : 'Create New Event'}
              </Typography>

              <Box sx={formControlStyle}>
                <label style={labelStyle} htmlFor="eventName">Event Name *</label>
                <input
                  id="eventName"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  placeholder="Enter event name"
                  required
                  fullWidth
                  style={inputStyle}
                  disabled={loading}
                />
              </Box>

              <Box sx={formControlStyle}>
                <label style={labelStyle} htmlFor="eventType">Event Type *</label>
                <Select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  required
                  sx={selectStyle}
                  disabled={loading}
                >
                  <MenuItem value="" disabled>
                    Select Event Type
                  </MenuItem>
                  {eventTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Box sx={formControlStyle}>
                <label style={labelStyle} htmlFor="eventDescription">Event Description</label>
                <input
                  id="eventDescription"
                  name="eventDescription"
                  value={formData.eventDescription}
                  onChange={handleChange}
                  placeholder="Enter event description"
                  multiline
                  rows={4}
                  fullWidth
                  style={inputStyle}
                  disabled={loading}
                />
              </Box>

              <Box sx={formControlStyle}>
                <label style={labelStyle} htmlFor="eventLocation">Event Location *</label>
                <input
                  id="eventLocation"
                  name="eventLocation"
                  value={formData.eventLocation}
                  onChange={handleChange}
                  placeholder="Enter event location"
                  required
                  fullWidth
                  sx={inputStyle}
                  disabled={loading}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <Box sx={{ flex: 1 }}>
                  <label style={labelStyle} htmlFor="eventDate">Event Date *</label>
                  <input
                    id="eventDate"
                    name="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={handleChange}
                    required
                    fullWidth
                    style={inputStyle}
                    disabled={loading}
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <label style={labelStyle} htmlFor="eventTime">Event Time</label>
                  <input
                    id="eventTime"
                    name="eventTime"
                    type="time"
                    value={formData.eventTime}
                    onChange={handleChange}
                    fullWidth
                    style={inputStyle}
                    disabled={loading}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    backgroundColor: '#3b82f6',
                    color: '#f1f5f9',
                    '&:hover': { backgroundColor: '#2563eb' },
                    '&:disabled': { backgroundColor: '#64748b', color: '#cbd5e1' }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: '#f1f5f9' }} />
                  ) : (
                    editMode ? 'Update Event' : 'Create Event'
                  )}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                    setError('');
                    setSuccess('');
                  }}
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

          <Dialog
            open={deleteConfirmOpen}
            onClose={() => setDeleteConfirmOpen(false)}
            PaperProps={{
              style: {
                backgroundColor: '#1F2A40',
                color: '#f1f5f9',
                border: '1px solid #475569',
              },
            }}
          >
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ color: '#94a3b8' }}>
                Are you sure you want to delete the event "{eventToDelete?.eventName}" 
                scheduled for {eventToDelete ? formatDate(eventToDelete.eventDate) : ''}? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setDeleteConfirmOpen(false)} 
                sx={{ color: '#94a3b8' }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteEvent} 
                sx={{ color: '#ef4444' }} 
                autoFocus
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default EventsManagement;