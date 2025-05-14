import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Paper, Chip, Divider,
  Modal, TextField, FormControl, Select, MenuItem,
  InputLabel, Grid, CircularProgress, Alert,
  Tabs, Tab
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle } from '../Admin/Student/formStyles';
import config from '@/assets/config';

const { url } = config;

const statusColors = {
  Scheduled: '#22c55e',
  Pending: '#f59e0b',
  Completed: '#3b82f6',
  Cancelled: '#ef4444'
};

const participantTypeColors = {
  Parents: '#8b5cf6',
  Teachers: '#06b6d4',
  School: '#14b8a6',
  DistrictHead: '#f43f5e',
  SchoolPrincipals: '#f43f5e'
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatTime = (timeString) => {
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Meetings = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [districtMeetings, setDistrictMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
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
    agenda: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterParticipantType, setFilterParticipantType] = useState('All');
  const [tabValue, setTabValue] = useState(0);
  const [showDistrictMeetings, setShowDistrictMeetings] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('principalToken');
      if (!token) {
        navigate('/login/principal');
        return;
      }

      const response = await axios.get(`${url}/api/schools/meetings`, {
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
        localStorage.removeItem('principalToken');
        navigate('/login/principal');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDistrictMeetings = async () => {
    setDistrictLoading(true);
    try {
      const token = localStorage.getItem('principalToken');
      if (!token) {
        navigate('/login/principal');
        return;
      }

      const response = await axios.get(`${url}/api/schools/districthead-meetings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setDistrictMeetings(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching district meetings:', error);
      setError('Failed to load district meetings. Please try again later.');
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('principalToken');
        navigate('/login/principal');
      }
    } finally {
      setDistrictLoading(false);
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
      agenda: ''
    });
    setOpenCreateModal(true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('principalToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/principal');
        return;
      }

      console.log('selectedMeeting:', selectedMeeting);

      const response = await axios.put(
        `${url}/api/schools/meetings/${selectedMeeting.meetingId}`,
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
          localStorage.removeItem('principalToken');
          navigate('/login/principal');
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
      const token = localStorage.getItem('principalToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/principal');
        return;
      }

      const response = await axios.post(
        `${url}/api/schools/meetings`,
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
          localStorage.removeItem('principalToken');
          navigate('/login/principal');
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1 && districtMeetings.length === 0) {
      fetchDistrictMeetings();
    }
  };

  const filteredMeetings = meetings
    .filter(meeting => filterStatus === 'All' || meeting.status === filterStatus)
    .filter(meeting => filterParticipantType === 'All' || meeting.participantType === filterParticipantType);

  return (
    <Box sx={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #475569', paddingBottom: '16px' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{ color: '#f1f5f9' }}
        >
          School Meetings
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
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              color: '#94a3b8',
              '&.Mui-selected': {
                color: '#3b82f6',
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#3b82f6',
            }
          }}
        >
          <Tab label="School Meetings" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="District Head Meetings" id="tab-1" aria-controls="tabpanel-1" />
        </Tabs>
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

      <div
        role="tabpanel"
        hidden={tabValue !== 0}
        id="tabpanel-0"
        aria-labelledby="tab-0"
      >
        {tabValue === 0 && (
          <>
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
                  <MenuItem value="Parents">Parents</MenuItem>
                  <MenuItem value="Teachers">Teachers</MenuItem>
                  <MenuItem value="School">Whole School</MenuItem>
                  <MenuItem value="DistrictHead">District Head</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <CircularProgress sx={{ color: '#3b82f6' }} />
              </Box>
            ) : filteredMeetings.length === 0 ? (
              <Typography sx={{ color: '#f1f5f9', textAlign: 'center', padding: '40px' }}>
                No meetings found with the selected filters.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredMeetings.map((meeting) => (
                  <Paper
                    key={meeting._id || meeting.meetingId}
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
                        </Box>
                        <Typography sx={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '4px' }}>
                          <strong>Date:</strong> {formatDate(meeting.date)} • <strong>Time:</strong> {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                        </Typography>
                        <Typography sx={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                          <strong>Location:</strong> {meeting.location}
                        </Typography>
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
                        <Box sx={{ marginTop: '16px', display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
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
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Box>
            )}
          </>
        )}
      </div>

      <div
        role="tabpanel"
        hidden={tabValue !== 1}
        id="tabpanel-1"
        aria-labelledby="tab-1"
      >
        {tabValue === 1 && (
          <>
            {districtLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <CircularProgress sx={{ color: '#3b82f6' }} />
              </Box>
            ) : districtMeetings.length === 0 ? (
              <Typography sx={{ color: '#f1f5f9', textAlign: 'center', padding: '40px' }}>
                No meetings with district head found.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {districtMeetings.map((meeting) => (
                  <Paper
                    key={meeting._id || meeting.meetingId}
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
                          <Chip
                            label={meeting.meetingType === 'district_initiated' ? 'District Initiated' : 'Principal Initiated'}
                            size="small"
                            sx={{
                              backgroundColor: meeting.meetingType === 'district_initiated' ? '#f97316' : '#8b5cf6',
                              color: '#ffffff',
                              fontWeight: 'bold',
                              marginLeft: '8px'
                            }}
                          />
                        </Box>
                        {meeting.districtInfo && meeting.districtInfo.name && (
                          <Typography sx={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '4px' }}>
                            <strong>District:</strong> {meeting.districtInfo.name}
                          </Typography>
                        )}
                        <Typography sx={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '4px' }}>
                          <strong>Date:</strong> {formatDate(meeting.date)} • <strong>Time:</strong> {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                        </Typography>
                        <Typography sx={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                          <strong>Location:</strong> {meeting.location}
                        </Typography>
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
                        <Box sx={{ marginTop: '16px', display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                          <Button
                            variant="outlined"
                            onClick={() => handleOpenModal(meeting)}
                            sx={{
                              color: meeting.meetingType === 'principal_initiated' && (meeting.status === 'Scheduled' || meeting.status === 'Pending') ? '#3b82f6' : '#94a3b8',
                              borderColor: meeting.meetingType === 'principal_initiated' && (meeting.status === 'Scheduled' || meeting.status === 'Pending') ? '#3b82f6' : '#475569',
                              '&:hover': {
                                backgroundColor: meeting.meetingType === 'principal_initiated' && (meeting.status === 'Scheduled' || meeting.status === 'Pending') ? 'rgba(59, 130, 246, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                borderColor: meeting.meetingType === 'principal_initiated' && (meeting.status === 'Scheduled' || meeting.status === 'Pending') ? '#60a5fa' : '#64748b'
                              }
                            }}
                          >
                            {meeting.meetingType === 'principal_initiated' && (meeting.status === 'Scheduled' || meeting.status === 'Pending') ? 'Manage' : 'View Details'}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Box>
            )}
          </>
        )}
      </div>

      {/* View/Update Meeting Modal */}
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
                {selectedMeeting.meetingType === 'district_initiated' ? 'District Meeting Details' : (
                  selectedMeeting.status === 'Scheduled' || selectedMeeting.status === 'Pending' ? 'Manage Meeting' : 'Meeting Details'
                )}
              </Typography>

              {selectedMeeting.meetingType === 'district_initiated' && selectedMeeting.districtInfo && (
                <Box sx={{ marginBottom: '16px' }}>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>District</Typography>
                  <Typography sx={{ color: '#f1f5f9' }}>
                    {selectedMeeting.districtInfo.name}
                  </Typography>
                </Box>
              )}

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
                {selectedMeeting.meetingType && (
                  <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                    <Typography sx={{ color: '#f1f5f9', marginRight: '10px' }}>
                      Meeting Type:
                    </Typography>
                    <Chip
                      label={selectedMeeting.meetingType === 'district_initiated' ? 'District Initiated' : 'Principal Initiated'}
                      size="small"
                      sx={{
                        backgroundColor: selectedMeeting.meetingType === 'district_initiated' ? '#f97316' : '#8b5cf6',
                        color: '#ffffff',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                )}
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
                  {selectedMeeting.participantType || (selectedMeeting.meetingType === 'district_initiated' ? 'School Principals' : 'District Head')}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: '16px' }}>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>Description</Typography>
                <Typography sx={{ color: '#f1f5f9', backgroundColor: '#1e293b', padding: '8px', borderRadius: '4px' }}>
                  {selectedMeeting.description}
                </Typography>
              </Box>

              {selectedMeeting.agenda && (
                <Box sx={{ marginBottom: '16px' }}>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>Agenda</Typography>
                  <Typography sx={{ color: '#f1f5f9', backgroundColor: '#1e293b', padding: '8px', borderRadius: '4px' }}>
                    {selectedMeeting.agenda}
                  </Typography>
                </Box>
              )}

              {/* Only show update options if it's not a district initiated meeting or if it's a principal initiated meeting with Scheduled/Pending status */}
              {(!selectedMeeting.meetingType || selectedMeeting.meetingType === 'principal_initiated') &&
                (selectedMeeting.status === 'Scheduled' || selectedMeeting.status === 'Pending') && (
                  <>
                    <FormControl
                      variant="outlined"
                      fullWidth
                      sx={{
                        marginBottom: '16px',
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
                      <InputLabel id="status-label">Update Status</InputLabel>
                      <Select
                        labelId="status-label"
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        label="Update Status"
                      >
                        <MenuItem value="Scheduled">Scheduled</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      id="remarks"
                      name="remarks"
                      label="Remarks/Notes"
                      multiline
                      rows={4}
                      value={formData.remarks}
                      onChange={handleChange}
                      fullWidth
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
                  </>
                )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
                <Button
                  onClick={() => setOpenModal(false)}
                  sx={{
                    color: '#94a3b8',
                    '&:hover': {
                      backgroundColor: 'rgba(148, 163, 184, 0.1)',
                    }
                  }}
                >
                  Close
                </Button>
                {(!selectedMeeting.meetingType || selectedMeeting.meetingType === 'principal_initiated') &&
                  (selectedMeeting.status === 'Scheduled' || selectedMeeting.status === 'Pending') && (
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      sx={{
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        '&:hover': {
                          backgroundColor: '#2563eb',
                        }
                      }}
                    >
                      {isSubmitting ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Update'}
                    </Button>
                  )}
              </Box>
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
              marginBottom: '24px',
              borderBottom: '1px solid #475569',
              paddingBottom: '16px'
            }}
          >
            Schedule New Meeting
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                id="title"
                name="title"
                label="Meeting Title"
                value={newMeetingData.title}
                onChange={handleNewMeetingChange}
                fullWidth
                required
                sx={inputStyle}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="description"
                name="description"
                label="Description"
                multiline
                rows={3}
                value={newMeetingData.description}
                onChange={handleNewMeetingChange}
                fullWidth
                required
                sx={inputStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="date"
                name="date"
                label="Date"
                type="date"
                value={newMeetingData.date}
                onChange={handleNewMeetingChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
                sx={inputStyle}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                id="startTime"
                name="startTime"
                label="Start Time"
                type="time"
                value={newMeetingData.startTime}
                onChange={handleNewMeetingChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
                sx={inputStyle}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                id="endTime"
                name="endTime"
                label="End Time"
                type="time"
                value={newMeetingData.endTime}
                onChange={handleNewMeetingChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
                sx={inputStyle}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="location"
                name="location"
                label="Location"
                value={newMeetingData.location}
                onChange={handleNewMeetingChange}
                fullWidth
                required
                sx={inputStyle}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required sx={inputStyle}>
                <InputLabel id="participant-label" sx={labelStyle}>Participant Type</InputLabel>
                <Select
                  labelId="participant-label"
                  id="participantType"
                  name="participantType"
                  value={newMeetingData.participantType}
                  onChange={handleNewMeetingChange}
                  label="Participant Type"
                >
                  <MenuItem value="Parents">Parents</MenuItem>
                  <MenuItem value="Teachers">Teachers</MenuItem>
                  <MenuItem value="School">Whole School</MenuItem>
                  <MenuItem value="DistrictHead">District Head</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="agenda"
                name="agenda"
                label="Meeting Agenda (Optional)"
                multiline
                rows={3}
                value={newMeetingData.agenda}
                onChange={handleNewMeetingChange}
                fullWidth
                sx={inputStyle}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '24px' }}>
            <Button
              onClick={() => setOpenCreateModal(false)}
              sx={{
                color: '#94a3b8',
                '&:hover': {
                  backgroundColor: 'rgba(148, 163, 184, 0.1)',
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#2563eb',
                }
              }}
            >
              {isSubmitting ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Create Meeting'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Meetings;