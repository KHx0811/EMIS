import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import { inputStyle, labelStyle } from '../../forms/Admin/Student/formStyles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';

const url = import.meta.env.VITE_API_URL;


const ContactAdmin = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [previousRequests, setPreviousRequests] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  const POLLING_INTERVAL = 10000;

  useEffect(() => {
    fetchPreviousRequests();

    const intervalId = setInterval(() => {
      if (isPolling) {
        fetchPreviousRequests(false);
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isPolling]);

  const fetchPreviousRequests = async (showLoading = true) => {
    if (showLoading) {
      setLoadingHistory(true);
    }

    try {
      const token = localStorage.getItem('principalToken');
      const response = await axios.get(
        `${url}/api/schools/contact-admin/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newData = response.data.data;
      if (JSON.stringify(newData) !== JSON.stringify(previousRequests)) {
        setPreviousRequests(newData);
      }
    } catch (error) {
      console.error('Failed to fetch previous requests:', error);
      if (showLoading) {
        setResponseMessage('Failed to load previous requests. Please try again.');
      }
    } finally {
      if (showLoading) {
        setLoadingHistory(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('principalToken');
      const userType = localStorage.getItem('userType') || 'principal';

      const payload = {
        userType,
        subject,
        message,
      };

      const response = await axios.post(
        `${url}/api/schools/contact-admin`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResponseMessage(response.data.message);
      setSubject('');
      setMessage('');
      fetchPreviousRequests();
    } catch (error) {
      setResponseMessage('Failed to send the request. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const toggleAccordion = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const togglePolling = () => {
    setIsPolling((prev) => !prev);
  };

  return (
    <Box sx={{ backgroundColor: '#111827', padding: '24px', borderRadius: '8px' }}>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{
          color: '#f3f4f6',
          marginBottom: '24px',
          borderBottom: '1px solid #374151',
          paddingBottom: '16px',
        }}
      >
        Contact Admin
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '32px',
        }}
      >
        <Box sx={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="subject">
            Subject *
          </label>
          <input
            id="subject"
            name="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            style={inputStyle}
          />
        </Box>

        <Box sx={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="message">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#3b82f6',
              color: '#f3f4f6',
              padding: '8px 16px',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send'}
          </Button>
        </Box>

        {responseMessage && (
          <Typography
            variant="body2"
            sx={{
              color: responseMessage.includes('Failed') ? '#ef4444' : '#22c55e',
              marginTop: '16px',
              textAlign: 'center',
            }}
          >
            {responseMessage}
          </Typography>
        )}
      </Box>

      <Box sx={{ marginTop: '32px' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            borderBottom: '1px solid #374151',
            paddingBottom: '8px',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: '#f3f4f6',
            }}
          >
            Previous Requests
          </Typography>

          <Button
            size="small"
            variant="outlined"
            onClick={togglePolling}
            sx={{
              color: isPolling ? '#22c55e' : '#9ca3af',
              borderColor: isPolling ? '#22c55e' : '#9ca3af',
              fontSize: '0.75rem',
              '&:hover': {
                borderColor: isPolling ? '#16a34a' : '#6b7280',
                backgroundColor: 'rgba(22, 163, 74, 0.04)',
              },
            }}
          >
            {isPolling ? 'Auto-refresh On' : 'Auto-refresh Off'}
          </Button>
        </Box>

        {loadingHistory ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
            <CircularProgress sx={{ color: '#f3f4f6' }} />
          </Box>
        ) : previousRequests.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {previousRequests.map((request) => (
              <Box
                key={request._id}
                sx={{
                  backgroundColor: '#1f2937',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  border: '1px solid #374151',
                }}
              >
                <Box
                  onClick={() => toggleAccordion(request._id)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: expandedId === request._id ? '1px solid #374151' : 'none',
                    '&:hover': {
                      backgroundColor: '#273549',
                    },
                  }}
                >
                  <Typography
                    sx={{
                      color: '#f3f4f6',
                      fontWeight: 500,
                      flexGrow: 1,
                    }}
                  >
                    {request.subject}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      {formatDate(request.createdAt)}
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: request.response ? '#10b981' : '#f59e0b',
                        color: '#f3f4f6',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'medium',
                      }}
                    >
                      {request.response ? 'Answered' : 'Pending'}
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        transform: expandedId === request._id ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease-in-out',
                      }}
                    >
                      <ExpandMoreIcon sx={{ color: '#9ca3af' }} />
                    </Box>
                  </Box>
                </Box>

                {expandedId === request._id && (
                  <Box sx={{ padding: '16px', backgroundColor: '#111827' }}>
                    <Typography variant="subtitle2" sx={{ color: '#9ca3af', marginBottom: '4px' }}>
                      Your Message:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        backgroundColor: '#1f2937',
                        padding: '12px',
                        borderRadius: '4px',
                        marginBottom: '16px',
                        whiteSpace: 'pre-wrap',
                        color: '#f3f4f6',
                      }}
                    >
                      {request.message}
                    </Typography>

                    {request.response ? (
                      <>
                        <Typography variant="subtitle2" sx={{ color: '#9ca3af', marginBottom: '4px' }}>
                          Admin Response:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            backgroundColor: '#1e40af',
                            padding: '12px',
                            borderRadius: '4px',
                            whiteSpace: 'pre-wrap',
                            color: '#f3f4f6',
                          }}
                        >
                          {request.response}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: '#9ca3af', display: 'block', textAlign: 'right', marginTop: '8px' }}
                        >
                          Responded on: {formatDate(request.respondedAt)}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
                        Waiting for admin response...
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography sx={{ color: '#9ca3af', textAlign: 'center', padding: '24px' }}>
            No previous requests found
          </Typography>
        )}

        {!isPolling && (
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <Button
              variant="outlined"
              onClick={() => fetchPreviousRequests()}
              sx={{
                color: '#9ca3af',
                borderColor: '#4b5563',
                '&:hover': {
                  borderColor: '#6b7280',
                  backgroundColor: 'rgba(107, 114, 128, 0.04)',
                },
              }}
            >
              Refresh
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ContactAdmin;