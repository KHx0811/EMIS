import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Paper, Chip, Divider,
  Modal, TextField, FormControl, Select, MenuItem,
  InputLabel, Grid, CircularProgress, Alert, Autocomplete,
  Tabs, Tab
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const url = import.meta.env.VITE_API_URL;

const statusColors = {
  Scheduled: '#22c55e',
  Pending: '#f59e0b',
  Completed: '#3b82f6',
  Cancelled: '#ef4444'
};

const participantTypeColors = {
  SchoolPrincipals: '#8b5cf6',
  Ministers: '#06b6d4',
  'Education Department': '#14b8a6',
  Staff: '#f43f5e',
  Other: '#6366f1'
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatTime = (timeString) => {
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const DistrictMeetings = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDeleteConfirmModal, setOpenDeleteConfirmModal] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    remarks: ''
  });
  const [newMeetingData, setNewMeetingData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    participantType: '',
    schoolId: '',
    agenda: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterParticipantType, setFilterParticipantType] = useState('All');
  
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchMeetings();
    fetchSchools();
  }, []);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('districtToken');
      if (!token) {
        navigate('/login/district');
        return;
      }

      const response = await axios.get(`${url}/api/districts/meetings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMeetings(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setError('Failed to load meetings. Please try again later.');
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('districtToken');
        navigate('/login/district');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    setSchoolsLoading(true);
    try {
      const token = localStorage.getItem('districtToken');
      if (!token) {
        navigate('/login/district');
        return;
      }

      const response = await axios.get(`${url}/api/districts/schools`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSchools(response.data.data || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setSchoolsLoading(false);
    }
  };

  const handleOpenModal = (meeting) => {
    setSelectedMeeting(meeting);
    setFormData({
      status: meeting.status,
      remarks: meeting.remarks || ''
    });
    setOpenModal(true);
  };

  const handleOpenCreateModal = () => {
    setNewMeetingData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      participantType: '',
      schoolId: '',
      agenda: ''
    });
    setOpenCreateModal(true);
  };

  const handleOpenDeleteConfirmModal = (meeting) => {
    setMeetingToDelete(meeting);
    setOpenDeleteConfirmModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNewMeetingChange = (e) => {
    const { name, value } = e.target;
    setNewMeetingData({
      ...newMeetingData,
      [name]: value
    });
  };

  const handleSchoolChange = (event, value) => {
    setNewMeetingData({
      ...newMeetingData,
      schoolId: value ? value.school_id : ''
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('districtToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/district');
        return;
      }

      const response = await axios.put(
        `${url}/api/districts/meetings/${selectedMeeting.meetingId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMeetings(prevMeetings => 
        prevMeetings.map(meeting => 
          meeting.meetingId === selectedMeeting.meetingId 
            ? { ...meeting, status: formData.status, remarks: formData.remarks } 
            : meeting
        )
      );
      
      setSuccess(`Meeting status updated to ${formData.status.toLowerCase()} successfully`);
      setOpenModal(false);

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating meeting:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('districtToken');
          navigate('/login/district');
        } else {
          setError(`Error updating meeting: ${error.response.data.message || 'Please try again.'}`);
        }
      } else {
        setError('Error updating meeting. Please check your network connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('districtToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/district');
        return;
      }

      const response = await axios.post(
        `${url}/api/districts/meetings`,
        newMeetingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMeetings([response.data.data, ...meetings]);
      setSuccess('Meeting created successfully');
      setOpenCreateModal(false);

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error creating meeting:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('districtToken');
          navigate('/login/district');
        } else {
          setError(`Error creating meeting: ${error.response.data.message || 'Please try again.'}`);
        }
      } else {
        setError('Error creating meeting. Please check your network connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMeeting = async () => {
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('districtToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/district');
        return;
      }

      await axios.delete(
        `${url}/api/districts/meetings/${meetingToDelete.meetingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMeetings(prevMeetings => 
        prevMeetings.filter(meeting => meeting.meetingId !== meetingToDelete.meetingId)
      );
      
      setSuccess('Meeting deleted successfully');
      setOpenDeleteConfirmModal(false);
      setMeetingToDelete(null);

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting meeting:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('districtToken');
          navigate('/login/district');
        } else if (error.response.status === 400) {
          setError(error.response.data.message || 'Cannot delete this meeting.');
        } else {
          setError(`Error deleting meeting: ${error.response.data.message || 'Please try again.'}`);
        }
      } else {
        setError('Error deleting meeting. Please check your network connection.');
      }
    } finally {
      setIsSubmitting(false);
      setOpenDeleteConfirmModal(false);
    }
  };


  const districtMeetings = meetings
    .filter(meeting => meeting.participantType !== 'SchoolPrincipals')
    .filter(meeting => filterStatus === 'All' || meeting.status === filterStatus)
    .filter(meeting => filterParticipantType === 'All' || meeting.participantType === filterParticipantType);

  const principalMeetings = meetings
    .filter(meeting => meeting.participantType === 'SchoolPrincipals')
    .filter(meeting => filterStatus === 'All' || meeting.status === filterStatus);

 
  const currentMeetings = activeTab === 0 ? districtMeetings : principalMeetings;

  return (
    <Box sx={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #475569', paddingBottom: '16px' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{ color: '#f1f5f9' }}
        >
          District Meetings
        </Typography>
        <Button
          variant="contained"
          onClick={handleOpenCreateModal}
          sx={{
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#2563eb',
            }
          }}
        >
          Schedule New Meeting
        </Button>
      </Box>


      <Box sx={{ borderBottom: 1, borderColor: '#475569', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ 
            '& .MuiTab-root': { 
              color: '#94a3b8',
              '&.Mui-selected': { 
                color: '#3b82f6' 
              }
            },
            '& .MuiTabs-indicator': { 
              backgroundColor: '#3b82f6' 
            }
          }}
        >
          <Tab 
            label="DISTRICT MEETINGS" 
            sx={{ 
              fontWeight: 'bold', 
              fontSize: '0.9rem'
            }} 
          />
          <Tab 
            label="SCHOOL PRINCIPAL MEETINGS" 
            sx={{ 
              fontWeight: 'bold', 
              fontSize: '0.9rem'
            }} 
          />
        </Tabs>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <FormControl
          variant="outlined"
          size="small"
          sx={{
            minWidth: 150,
            '& .MuiOutlinedInput-root': {
              color: '#f1f5f9',
              '& fieldset': {
                borderColor: '#475569',
              },
              '&:hover fieldset': {
                borderColor: '#94a3b8',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#3b82f6',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#94a3b8',
            },
            '& .MuiSelect-icon': {
              color: '#94a3b8',
            }
          }}
        >
          <InputLabel id="filter-status-label">Status</InputLabel>
          <Select
            labelId="filter-status-label"
            id="filter-status"
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="Scheduled">Scheduled</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>

        {activeTab === 0 && (
          <FormControl
            variant="outlined"
            size="small"
            sx={{
              minWidth: 180,
              '& .MuiOutlinedInput-root': {
                color: '#f1f5f9',
                '& fieldset': {
                  borderColor: '#475569',
                },
                '&:hover fieldset': {
                  borderColor: '#94a3b8',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#94a3b8',
              },
              '& .MuiSelect-icon': {
                color: '#94a3b8',
              }
            }}
          >
            <InputLabel id="filter-participant-label">Participant Type</InputLabel>
            <Select
              labelId="filter-participant-label"
              id="filter-participant"
              value={filterParticipantType}
              label="Participant Type"
              onChange={(e) => setFilterParticipantType(e.target.value)}
            >
              <MenuItem value="All">All Participants</MenuItem>
              <MenuItem value="Ministers">Ministers</MenuItem>
              <MenuItem value="Education Department">Education Department</MenuItem>
              <MenuItem value="Staff">Staff</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>

      {success && (
        <Alert severity="success" sx={{ marginBottom: 2, backgroundColor: '#042f2e', color: '#ecfdf5', border: '1px solid #065f46' }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ marginBottom: 2, backgroundColor: '#7f1d1d', color: '#fef2f2', border: '1px solid #dc2626' }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <CircularProgress sx={{ color: '#3b82f6' }} />
        </Box>
      ) : currentMeetings.length === 0 ? (
        <Typography sx={{ color: '#f1f5f9', textAlign: 'center', padding: '40px' }}>
          No meetings found with the selected filters.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentMeetings.map((meeting) => (
            <Paper
              key={meeting._id}
              elevation={2}
              sx={{
                padding: '16px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f1f5f9'
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {meeting.title}
                    </Typography>
                    <Chip
                      label={meeting.status}
                      size="small"
                      sx={{
                        backgroundColor: statusColors[meeting.status],
                        color: '#ffffff',
                        fontWeight: 'bold',
                        marginLeft: '12px'
                      }}
                    />
                    {activeTab === 0 && (
                      <Chip
                        label={meeting.participantType}
                        size="small"
                        sx={{
                          backgroundColor: participantTypeColors[meeting.participantType],
                          color: '#ffffff',
                          fontWeight: 'bold',
                          marginLeft: '8px'
                        }}
                      />
                    )}
                  </Box>
                  <Typography sx={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '4px' }}>
                    <strong>Date:</strong> {formatDate(meeting.date)} • <strong>Time:</strong> {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                    <strong>Location:</strong> {meeting.location}
                  </Typography>
                  {meeting.participantType === 'SchoolPrincipals' && meeting.schoolId && (
                    <Typography sx={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                      <strong>School:</strong> {meeting.schoolId}
                    </Typography>
                  )}
                  <Divider sx={{ my: 1, backgroundColor: '#475569' }} />
                  <Typography sx={{ marginTop: '8px' }}>
                    {meeting.description}
                  </Typography>
                  {meeting.agenda && (
                    <Typography sx={{ marginTop: '8px', fontStyle: 'italic', fontSize: '0.9rem' }}>
                      <strong>Agenda:</strong> {meeting.agenda}
                    </Typography>
                  )}
                  {meeting.remarks && (
                    <Typography sx={{ marginTop: '8px', fontStyle: 'italic', fontSize: '0.9rem' }}>
                      <strong>Remarks:</strong> {meeting.remarks}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: { xs: 'left', sm: 'right' } }}>
                    Created on {formatDate(meeting.createdAt)}
                  </Typography>
                  <Box sx={{ marginTop: '16px', display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: '8px' }}>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenModal(meeting)}
                      sx={{
                        color: meeting.status === 'Scheduled' || meeting.status === 'Pending' ? '#3b82f6' : '#94a3b8',
                        borderColor: meeting.status === 'Scheduled' || meeting.status === 'Pending' ? '#3b82f6' : '#475569',
                        '&:hover': {
                          backgroundColor: meeting.status === 'Scheduled' || meeting.status === 'Pending' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                          borderColor: meeting.status === 'Scheduled' || meeting.status === 'Pending' ? '#60a5fa' : '#64748b'
                        }
                      }}
                    >
                      {meeting.status === 'Scheduled' || meeting.status === 'Pending' ? 'Manage' : 'View Details'}
                    </Button>
                    {(meeting.status === 'Scheduled' || meeting.status === 'Pending') && (
                      <Button
                        variant="outlined"
                        onClick={() => handleOpenDeleteConfirmModal(meeting)}
                        sx={{
                          color: '#ef4444',
                          borderColor: '#ef4444',
                          '&:hover': {
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderColor: '#f87171'
                          }
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>
      )}

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="meeting-modal"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0f172a',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          {selectedMeeting && (
            <>
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{
                  color: '#f1f5f9',
                  marginBottom: '16px',
                  borderBottom: '1px solid #475569',
                  paddingBottom: '16px'
                }}
              >
                {selectedMeeting.status === 'Scheduled' || selectedMeeting.status === 'Pending' ? 'Manage Meeting' : 'Meeting Details'}
              </Typography>

              <Box sx={{ marginBottom: '20px' }}>
                <Typography sx={{ color: '#f1f5f9', fontWeight: 'bold' }}>
                  {selectedMeeting.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                  <Typography sx={{ color: '#f1f5f9', marginRight: '10px' }}>
                    Current Status:
                  </Typography>
                  <Chip
                    label={selectedMeeting.status}
                    size="small"
                    sx={{
                      backgroundColor: statusColors[selectedMeeting.status],
                      color: '#ffffff',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ marginBottom: '16px' }}>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>Date and Time</Typography>
                <Typography sx={{ color: '#f1f5f9' }}>
                  {formatDate(selectedMeeting.date)}, {formatTime(selectedMeeting.startTime)} - {formatTime(selectedMeeting.endTime)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: '16px' }}>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>Location</Typography>
                <Typography sx={{ color: '#f1f5f9' }}>
                  {selectedMeeting.location}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: '16px' }}>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>Participants</Typography>
                <Typography sx={{ color: '#f1f5f9' }}>
                  {selectedMeeting.participantType}
                  {selectedMeeting.participantType === 'SchoolPrincipals' && selectedMeeting.schoolId && (
                    <> (School: {selectedMeeting.schoolId})</>
                  )}
                </Typography>
              </Box>

              {selectedMeeting.agenda && (
                <Box sx={{ marginBottom: '16px' }}>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>Agenda</Typography>
                  <Typography sx={{ color: '#f1f5f9' }}>
                    {selectedMeeting.agenda}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2, backgroundColor: '#475569' }} />

              {(selectedMeeting.status === 'Scheduled' || selectedMeeting.status === 'Pending') ? (
                <>
                  <FormControl 
                    fullWidth 
                    sx={{ marginBottom: '16px' }}
                    variant="outlined"
                  >
                    <InputLabel 
                      id="status-select-label"
                      sx={{ color: '#94a3b8' }}
                    >
                      Status
                    </InputLabel>
                    <Select
                      labelId="status-select-label"
                      id="status-select"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      label="Status"
                      required
                      sx={{
                        color: '#f1f5f9',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#475569'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#94a3b8'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#3b82f6'
                        },
                        '& .MuiSelect-icon': {
                          color: '#94a3b8'
                        }
                      }}
                    >
                      <MenuItem value="Scheduled">Scheduled</MenuItem>
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    id="remarks"
                    name="remarks"
                    label="Remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    variant="outlined"
                    sx={{
                      marginBottom: '24px',
                      '& .MuiOutlinedInput-root': {
                        color: '#f1f5f9',
                        '& fieldset': {
                          borderColor: '#475569',
                        },
                        '&:hover fieldset': {
                          borderColor: '#94a3b8',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#94a3b8',
                      }
                    }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      type="button"
                      onClick={() => setOpenModal(false)}
                      sx={{ color: '#94a3b8' }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      sx={{
                        backgroundColor: '#3b82f6',
                        '&:hover': {
                          backgroundColor: '#2563eb',
                        }
                      }}
                    >
                      {isSubmitting ? 'Updating...' : 'Update Meeting'}
                    </Button>
                  </Box>
                </>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    onClick={() => setOpenModal(false)}
                    sx={{ color: '#94a3b8' }}
                  >
                    Close
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Modal>

      <Modal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        aria-labelledby="create-meeting-modal"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          component="form"
          onSubmit={handleCreateMeeting}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0f172a',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              color: '#f1f5f9',
              marginBottom: '16px',
              borderBottom: '1px solid #475569',
              paddingBottom: '16px'
            }}
          >
            Schedule New Meeting
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Meeting Title"
                value={newMeetingData.title}
                onChange={handleNewMeetingChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#f1f5f9',
                    '& fieldset': {
                      borderColor: '#475569',
                    },
                    '&:hover fieldset': {
                      borderColor: '#94a3b8',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94a3b8',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                value={newMeetingData.description}
                onChange={handleNewMeetingChange}
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#f1f5f9',
                    '& fieldset': {
                      borderColor: '#475569',
                    },
                    '&:hover fieldset': {
                      borderColor: '#94a3b8',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94a3b8',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="date"
                name="date"
                label="Date"
                type="date"
                value={newMeetingData.date}
                onChange={handleNewMeetingChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#f1f5f9',
                    '& fieldset': {
                      borderColor: '#475569',
                    },
                    '&:hover fieldset': {
                      borderColor: '#94a3b8',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94a3b8',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                id="startTime"
                name="startTime"
                label="Start Time"
                type="time"
                value={newMeetingData.startTime}
                onChange={handleNewMeetingChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#f1f5f9',
                    '& fieldset': {
                      borderColor: '#475569',
                    },
                    '&:hover fieldset': {
                      borderColor: '#94a3b8',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94a3b8',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                id="endTime"
                name="endTime"
                label="End Time"
                type="time"
                value={newMeetingData.endTime}
                onChange={handleNewMeetingChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#f1f5f9',
                    '& fieldset': {
                      borderColor: '#475569',
                    },
                    '&:hover fieldset': {
                      borderColor: '#94a3b8',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94a3b8',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="location"
                name="location"
                label="Location"
                value={newMeetingData.location}
                onChange={handleNewMeetingChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#f1f5f9',
                    '& fieldset': {
                      borderColor: '#475569',
                    },
                    '&:hover fieldset': {
                      borderColor: '#94a3b8',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94a3b8',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl
                fullWidth
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#f1f5f9',
                    '& fieldset': {
                      borderColor: '#475569',
                    },
                    '&:hover fieldset': {
                      borderColor: '#94a3b8',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94a3b8',
                  },
                  '& .MuiSelect-icon': {
                    color: '#94a3b8',
                  }
                }}
              >
                <InputLabel id="participant-type-label">Participant Type</InputLabel>
                <Select
                  labelId="participant-type-label"
                  id="participantType"
                  name="participantType"
                  value={newMeetingData.participantType}
                  onChange={handleNewMeetingChange}
                  label="Participant Type"
                >
                  <MenuItem value="SchoolPrincipals">School Principals</MenuItem>
                  <MenuItem value="Ministers">Ministers</MenuItem>
                  <MenuItem value="Education Department">Education Department</MenuItem>
                  <MenuItem value="Staff">Staff</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {newMeetingData.participantType === 'SchoolPrincipals' && (
              <Grid item xs={12}>
                <Autocomplete
                  id="school-select"
                  options={schools}
                  getOptionLabel={(option) => option.name || ''}
                  loading={schoolsLoading}
                  onChange={handleSchoolChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select School"
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#f1f5f9',
                          '& fieldset': {
                            borderColor: '#475569',
                          },
                          '&:hover fieldset': {
                            borderColor: '#94a3b8',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#94a3b8',
                        }
                      }}
                    />
                  )}
                  sx={{
                    '& .MuiAutocomplete-endAdornment': {
                      color: '#94a3b8'
                    }
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="agenda"
                name="agenda"
                label="Meeting Agenda"
                value={newMeetingData.agenda}
                onChange={handleNewMeetingChange}
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#f1f5f9',
                    '& fieldset': {
                      borderColor: '#475569',
                    },
                    '&:hover fieldset': {
                      borderColor: '#94a3b8',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94a3b8',
                  }
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginTop: '24px' }}>
            <Button
              type="button"
              onClick={() => setOpenCreateModal(false)}
              sx={{ color: '#94a3b8' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                backgroundColor: '#3b82f6',
                '&:hover': {
                  backgroundColor: '#2563eb',
                }
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Meeting'}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={openDeleteConfirmModal}
        onClose={() => setOpenDeleteConfirmModal(false)}
        aria-labelledby="delete-confirm-modal"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0f172a',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '400px',
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              color: '#f1f5f9',
              marginBottom: '16px'
            }}
          >
            Confirm Deletion
          </Typography>

          <Typography sx={{ color: '#f1f5f9', marginBottom: '20px' }}>
            Are you sure you want to delete this meeting? This action cannot be undone.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              type="button"
              onClick={() => setOpenDeleteConfirmModal(false)}
              sx={{ color: '#94a3b8' }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="contained"
              onClick={handleDeleteMeeting}
              disabled={isSubmitting}
              sx={{
                backgroundColor: '#ef4444',
                '&:hover': {
                  backgroundColor: '#dc2626',
                }
              }}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Meeting'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default DistrictMeetings;