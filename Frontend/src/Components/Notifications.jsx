import React, { useState, useEffect, useRef } from 'react';
import { 
  Badge, 
  Box, 
  Button, 
  Typography, 
  Popper, 
  Paper, 
  ClickAwayListener,
  Divider,
  FormControl,
  TextField,
  CircularProgress
} from '@mui/material';
import { Bell } from 'lucide-react';
import axios from 'axios';

const url = import.meta.env.URL;

const Notifications = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [response, setResponse] = useState('');
  const [responding, setResponding] = useState(false);
  const anchorRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const intervalId = setInterval(fetchMessages, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await axios.get(`${url}/api/admin/messages`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const fetchedMessages = response.data.data || [];
      setMessages(fetchedMessages);
      console.log('Fetched messages:', fetchedMessages);
      const unread = (response.data.messages || []).filter(msg => !msg.response).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
    if (selectedMessage) {
      setSelectedMessage(null);
      setResponse('');
    }
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
    setSelectedMessage(null);
    setResponse('');
  };

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    setResponse(message.response || '');
  };

  const handleBackToList = () => {
    setSelectedMessage(null);
    setResponse('');
  };

  const handleResponseChange = (e) => {
    setResponse(e.target.value);
  };

  const handleSubmitResponse = async () => {
    if (!selectedMessage || !response.trim()) return;
    
    try {
      setResponding(true);
      const token = localStorage.getItem('adminToken');
      
      await axios.post(`${url}/api/admin/respond-message`, {
        messageId: selectedMessage._id,
        response: response.trim()
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setMessages(messages.map(msg => 
        msg._id === selectedMessage._id 
        ? {...msg, response: response.trim(), respondedAt: new Date().toISOString()} 
        : msg
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      setSelectedMessage({...selectedMessage, response: response.trim(), respondedAt: new Date().toISOString()});
    } catch (error) {
      console.error('Error responding to message:', error);
      alert('Failed to send response. Please try again.');
    } finally {
      setResponding(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getUserTypeLabel = (userType) => {
    const labels = {
      'teacher': 'Teacher',
      'parent': 'Parent',
      'principal': 'Principal',
      'districthead': 'District Head'
    };
    return labels[userType] || userType;
  };

  return (
    <div>
      <Button
        ref={anchorRef}
        aria-controls={open ? 'notification-menu' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        sx={{ 
          minWidth: 'auto', 
          padding: '8px',
          color: '#f1f5f9',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)'
          }
        }}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          overlap="circular"
        >
          <Bell size={20} color="#f1f5f9" />
        </Badge>
      </Button>

      <Popper
        id="notification-menu"
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        style={{ zIndex: 1301 }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            sx={{
              width: '360px',
              maxHeight: '500px',
              overflow: 'hidden',
              backgroundColor: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155'
            }}
          >
            {selectedMessage ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
                <Box sx={{ 
                  padding: '12px 16px', 
                  borderBottom: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Button 
                    onClick={handleBackToList}
                    sx={{ 
                      minWidth: 'auto', 
                      color: '#f1f5f9',
                      padding: '4px',
                      marginRight: '8px',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)'
                      }
                    }}
                  >
                    ←
                  </Button>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Message Details
                  </Typography>
                </Box>

                <Box sx={{ padding: '16px', flexGrow: 1, overflowY: 'auto' }}>
                  <Typography variant="body2" color="#94a3b8" gutterBottom>
                    From: {getUserTypeLabel(selectedMessage.userType)} (ID: {selectedMessage.userId})
                  </Typography>
                  
                  <Typography variant="body2" color="#94a3b8" gutterBottom>
                    Received: {formatDate(selectedMessage.createdAt)}
                  </Typography>
                  
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                    {selectedMessage.subject}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                    {selectedMessage.message}
                  </Typography>

                  <Divider sx={{ my: 3, borderColor: '#334155' }} />
                  
                  <Typography variant="subtitle1" fontWeight="bold">
                    Your Response
                  </Typography>
                  
                  {selectedMessage.response ? (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedMessage.response}
                      </Typography>
                      <Typography variant="body2" color="#94a3b8" sx={{ mt: 1 }}>
                        Responded: {formatDate(selectedMessage.respondedAt)}
                      </Typography>
                    </Box>
                  ) : (
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <TextField
                        multiline
                        rows={4}
                        value={response}
                        onChange={handleResponseChange}
                        placeholder="Type your response here..."
                        sx={{
                          backgroundColor: '#0f172a',
                          borderRadius: '4px',
                          '& .MuiOutlinedInput-root': {
                            color: '#f1f5f9',
                            '& fieldset': {
                              borderColor: '#334155',
                            },
                            '&:hover fieldset': {
                              borderColor: '#475569',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#3b82f6',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#94a3b8',
                          },
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleSubmitResponse}
                        disabled={responding || !response.trim()}
                        sx={{
                          mt: 2,
                          backgroundColor: '#3b82f6',
                          color: '#f1f5f9',
                          '&:hover': {
                            backgroundColor: '#2563eb',
                          },
                          '&.Mui-disabled': {
                            backgroundColor: '#1e293b',
                            color: '#64748b',
                          }
                        }}
                      >
                        {responding ? (
                          <CircularProgress size={24} sx={{ color: '#f1f5f9' }} />
                        ) : (
                          'Send Response'
                        )}
                      </Button>
                    </FormControl>
                  )}
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
                <Box sx={{ 
                  padding: '16px', 
                  borderBottom: '1px solid #334155',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="h6">
                    Notifications
                  </Typography>
                  {unreadCount > 0 && (
                    <Typography variant="body2" color="#94a3b8">
                      {unreadCount} unread
                    </Typography>
                  )}
                </Box>

                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
                      <CircularProgress size={28} sx={{ color: '#3b82f6' }} />
                    </Box>
                  ) : messages.length > 0 ? (
                    messages.map((message) => (
                      <Box
                        key={message._id}
                        onClick={() => handleSelectMessage(message)}
                        sx={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #334155',
                          cursor: 'pointer',
                          backgroundColor: message.response ? '#0f172a' : '#172554',
                          '&:hover': {
                            backgroundColor: message.response ? '#1e293b' : '#1e3a8a'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {message.subject}
                          </Typography>
                          {!message.response && (
                            <Box
                              sx={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#ef4444',
                                marginLeft: '8px'
                              }}
                            />
                          )}
                        </Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            color: '#94a3b8'
                          }}
                        >
                          {message.message}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" color="#64748b">
                            {getUserTypeLabel(message.userType)}
                          </Typography>
                          <Typography variant="caption" color="#64748b">
                            {formatDate(message.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ padding: '24px', textAlign: 'center' }}>
                      <Typography variant="body1" color="#94a3b8">
                        No notifications to display
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ 
                  padding: '12px', 
                  borderTop: '1px solid #334155',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <Button
                    onClick={fetchMessages}
                    disabled={loading}
                    sx={{
                      color: '#3b82f6',
                      '&:hover': {
                        backgroundColor: 'rgba(59, 130, 246, 0.08)'
                      }
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={16} sx={{ mr: 1, color: '#3b82f6' }} />
                    ) : null}
                    Refresh
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </div>
  );
};

export default Notifications;