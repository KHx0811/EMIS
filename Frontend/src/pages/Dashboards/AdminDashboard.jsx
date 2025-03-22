import React, { useState, useEffect } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { ColorModeContext, useMode, tokens } from '../../assets/theme';
import AdminSidebar from '../../Components/AdminSidebar';
import CreateStudentForm from '@/forms/Student/CreateStudentForm';
import UpdateStudent from '@/forms/Student/UpdateStudent';
import StudentList from '@/forms/Student/StudentList';
import DeleteStudent from '@/forms/Student/DeleteStudent';
import axios from 'axios';

const AdminDashboard = () => {
  const [theme, colorMode] = useMode();
  const colors = tokens(theme.palette.mode);
  const [selectedMenuItem, setSelectedMenuItem] = useState('dashboard');
  const [counts, setCounts] = useState({
    studentCount: 0,
    teacherCount: 0,
    schoolCount: 0,
  });

const getToken = () => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    navigate('/admin');
    return null;
  }
  return token;
};

const checkTokenExpiration = () => {
  const token = localStorage.getItem('adminToken');
  if (!token) return;
  
  // Parse the token (JWT tokens are base64 encoded)
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    console.error('Invalid token format');
    return;
  }
  
  try {
    // Decode the payload (second part of the token)
    const payload = JSON.parse(atob(tokenParts[1]));
    console.log('Token payload:', payload);
    
    // Check if the token has expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      console.error('Token has expired at:', new Date(payload.exp * 1000));
      console.log('Current time:', new Date(currentTime * 1000));
      // Handle token expiration
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUsername');
      navigate('/login/admin');
    }
  } catch (e) {
    console.error('Error decoding token:', e);
  }
};

const fetchCounts = async () => {
  try {
    const token = getToken();
    if (!token) return; // getToken will handle the redirect
    
    const response = await axios.get('http://localhost:3000/api/stats/counts', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    setCounts(response.data.data);
  } catch (error) {
    console.error('Error fetching counts:', error);
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      alert('Your session has expired. Please login again.');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUsername');
      navigate('/admin');
    }
  }
};

  useEffect(() => {
    checkTokenExpiration();
  const token = localStorage.getItem('adminToken');
  if (!token) {
    navigate('/login/admin');
    return;
  }
  
  const verifyToken = async () => {
    try {
      await axios.get('http://localhost:3000/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchCounts();
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUsername');
      navigate('/login/admin');
    }
  };
  
  verifyToken();
  }, []);

  const renderContent = () => {
    switch (selectedMenuItem) {
      case 'createStudent':
        return <div><CreateStudentForm /></div>;
      case 'studentList':
        return <div><StudentList /></div>;
      case 'updateStudent':
        return <div><UpdateStudent /></div>;
      case 'deleteStudent':
        return <div><DeleteStudent /></div>;
      case 'createParent':
        return <div>Create Parent Form</div>;
      case 'parentList':
        return <div>Parent List</div>;
      case 'updateParent':
        return <div>Update Parent Form</div>;
      case 'deleteParent':
        return <div>Delete Parent Form</div>;
      case 'createTeacher':
        return <div>Create Teacher Form</div>;
      case 'teacherList':
        return <div>Teacher List</div>;
      case 'updateTeacher':
        return <div>Update Teacher Form</div>;
      case 'deleteTeacher':
        return <div>Delete Teacher Form</div>;
      case 'createSchool':
        return <div>Create School Form</div>;
      case 'schoolList':
        return <div>School List</div>;
      case 'updateSchool':
        return <div>Update School Form</div>;
      case 'deleteSchool':
        return <div>Delete School Form</div>;
      case 'createDistrict':
        return <div>Create District Form</div>;
      case 'districtList':
        return <div>District List</div>;
      case 'updateDistrict':
        return <div>Update District Form</div>;
      case 'deleteDistrict':
        return <div>Delete District Form</div>;
      default:
        return (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 3
            }}
          >
            <Box
              sx={{
                backgroundColor: theme.palette.mode === 'light'
                  ? colors.primary[400]
                  : colors.primary[600],
                borderRadius: '8px',
                p: 3,
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h3 style={{ color: colors.greenAccent[500], margin: '0 0 10px 0' }}>
                Total Students
              </h3>
              <p style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: colors.grey[100],
                margin: 0
              }}>
                {counts.studentCount}
              </p>
            </Box>

            <Box
              sx={{
                backgroundColor: theme.palette.mode === 'light'
                  ? colors.primary[400]
                  : colors.primary[600],
                borderRadius: '8px',
                p: 3,
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h3 style={{ color: colors.blueAccent[500], margin: '0 0 10px 0' }}>
                Total Teachers
              </h3>
              <p style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: colors.grey[100],
                margin: 0
              }}>
                {counts.teacherCount}
              </p>
            </Box>

            <Box
              sx={{
                backgroundColor: theme.palette.mode === 'light'
                  ? colors.primary[400]
                  : colors.primary[600],
                borderRadius: '8px',
                p: 3,
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h3 style={{ color: colors.redAccent[500], margin: '0 0 10px 0' }}>
                Total Schools
              </h3>
              <p style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: colors.grey[100],
                margin: 0
              }}>
                {counts.schoolCount}
              </p>
            </Box>
          </Box>
        );
    }
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', height: '100vh' }}>
          <AdminSidebar onMenuItemClick={setSelectedMenuItem} />
          
          <Box
            sx={{
              flexGrow: 1,
              p: 3,
              backgroundColor: theme.palette.mode === 'light' 
                ? colors.grey[900] 
                : colors.primary[500],
              overflow: 'auto'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                p: 2,
                backgroundColor: theme.palette.mode === 'light' 
                  ? colors.primary[400] 
                  : colors.primary[600],
                borderRadius: '8px',
                mb: 3
              }}
            >
              <h1 style={{ 
                color: colors.grey[100], 
                margin: 0, 
                fontSize: '1.5rem'
              }}>
                Admin Dashboard
              </h1>
            </Box>

            {renderContent()}
          </Box>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default AdminDashboard;