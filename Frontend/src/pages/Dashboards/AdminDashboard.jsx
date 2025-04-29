import React, { useState, useEffect } from 'react';
import { Box, CssBaseline } from '@mui/material';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

import AdminSidebar from '../../Components/Sidebars/AdminSidebar';
import SessionTimer from '../../Components/SessionTimer';

import CreateStudentForm from '@/forms/Admin/Student/CreateStudentForm';
import UpdateStudent from '@/forms/Admin/Student/UpdateStudent';
import StudentList from '@/forms/Admin/Student/StudentList';
import DeleteStudent from '@/forms/Admin/Student/DeleteStudent';

import CreateParent from '@/forms/Admin/Parent/CreateParent';
import UpdateParent from '@/forms/Admin/Parent/UpdateParent';
import ParentDetails from '@/forms/Admin/Parent/ParentDetails';
import DeleteParent from '@/forms/Admin/Parent/DeleteParent';

import CreateTeacher from '@/forms/Admin/Teacher/CreateTeacher';
import UpdateTeacher from '@/forms/Admin/Teacher/UpdateTeacher';
import TeacherDetails from '@/forms/Admin/Teacher/TeacherDetails';
import DeleteTeacher from '@/forms/Admin/Teacher/DeleteTeacher';

import CreateSchool from '@/forms/Admin/School/CreateSchool';
import UpdateSchool from '@/forms/Admin/School/UpdateSchool';
import SchoolDetails from '@/forms/Admin/School/SchoolDetails';
import DeleteSchool from '@/forms/Admin/School/DeleteSchool';

import CreateDistrict from '@/forms/Admin/District/CreateDistrict';
import UpdateDistrict from '@/forms/Admin/District/UpdateDistrict';
import DistrictDetails from '@/forms/Admin/District/DistrictDetails';
import DeleteDistrict from '@/forms/Admin/District/DeleteDistrict';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getSelectedMenuItem = () => {
    const pathSegments = location.pathname.split('/');
    return pathSegments.length > 3 ? pathSegments[3] : 'dashboard';
  };
  
  const [selectedMenuItem, setSelectedMenuItem] = useState(getSelectedMenuItem());
  const [counts, setCounts] = useState({
    studentCount: 0,
    teacherCount: 0,
    schoolCount: 0,
  });

  const handleMenuItemClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
    navigate(`/dashboard/admin/${menuItem}`);
  };

  const globalStyles = {
    '& .form-field': {
      marginBottom: '24px',
      position: 'relative',
    },
    '& input, & select, & textarea': {
      backgroundColor: '#1F2A40',
      color: '#e0e0e0',
      border: '1px solid #3d3d3d',
      padding: '12px 16px',
      borderRadius: '4px',
      width: '100%',
      fontSize: '0.9rem',
      height: '48px',
      '&:focus': {
        borderColor: '#00deb6',
        outline: 'none',
      },
      '&::placeholder': {
        color: '#a3a3a3',
      }
    },
    '& .MuiInputBase-root': {
      backgroundColor: '#1F2A40',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#3d3d3d',
    },
    '& .MuiInputBase-input': {
      color: '#e0e0e0',
    },
    '& .MuiInputLabel-root': {
      color: '#e0e0e0',
      '&.Mui-focused': {
        color: '#00deb6',
      }
    },
    '& .MuiFormLabel-root': {
      color: '#e0e0e0',
    },
    '& .MuiRadio-root': {
      color: '#a3a3a3',
      '&.Mui-checked': {
        color: '#00deb6',
      }
    },
    '& .MuiSelect-select': {
      backgroundColor: '#1F2A40',
      color: '#e0e0e0',
    },
    '& .MuiMenuItem-root': {
      backgroundColor: '#141b2d',
      color: '#e0e0e0',
      '&:hover': {
        backgroundColor: '#1F2A40',
      },
      '&.Mui-selected': {
        backgroundColor: 'rgba(0, 222, 182, 0.2)',
      }
    },
    '& .MuiFormControlLabel-label': {
      color: '#e0e0e0',
    },
    '& .MuiButton-contained': {
      backgroundColor: '#00deb6',
      color: '#0f1322',
      '&:hover': {
        backgroundColor: '#00b696',
      }
    }
  };

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
    
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error('Invalid token format');
      return;
    }
    
    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        console.error('Token has expired at:', new Date(payload.exp * 1000));
        console.log('Current time:', new Date(currentTime * 1000));
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('userType');
        navigate('/login/admin');
      }
    } catch (e) {
      console.error('Error decoding token:', e);
    }
  };

  const fetchCounts = async () => {
    try {
      const token = getToken();
      if (!token) return;
      
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
    
    setSelectedMenuItem(getSelectedMenuItem());
  }, [location.pathname]);

  const renderContent = () => {
    switch (selectedMenuItem) {
      case 'createStudent':
        return <Box sx={globalStyles}><CreateStudentForm /></Box>;
      case 'studentList':
        return <Box sx={globalStyles}><StudentList /></Box>;
      case 'updateStudent':
        return <Box sx={globalStyles}><UpdateStudent /></Box>;
      case 'deleteStudent':
        return <Box sx={globalStyles}><DeleteStudent /></Box>;
      case 'createParent':
        return <Box sx={globalStyles}><CreateParent /></Box>;
      case 'parentList':
        return <Box sx={globalStyles}><ParentDetails /></Box>;
      case 'updateParent':
        return <Box sx={globalStyles}><UpdateParent /></Box>;
      case 'deleteParent':
        return <Box sx={globalStyles}><DeleteParent /></Box>;
      case 'createTeacher':
        return <Box sx={globalStyles}><CreateTeacher /></Box>;
      case 'teacherList':
        return <Box sx={globalStyles}><TeacherDetails /></Box>;
      case 'updateTeacher':
        return <Box sx={globalStyles}><UpdateTeacher /></Box>;
      case 'deleteTeacher':
        return <Box sx={globalStyles}><DeleteTeacher /></Box>;
      case 'createSchool':
        return <Box sx={globalStyles}><CreateSchool /></Box>;
      case 'schoolList':
        return <Box sx={globalStyles}><SchoolDetails /></Box>;
      case 'updateSchool':
        return <Box sx={globalStyles}><UpdateSchool /></Box>;
      case 'deleteSchool':
        return <Box sx={globalStyles}><DeleteSchool /></Box>;
      case 'createDistrict':
        return <Box sx={globalStyles}><CreateDistrict /></Box>;
      case 'districtList':
        return <Box sx={globalStyles}><DistrictDetails /></Box>;
      case 'updateDistrict':
        return <Box sx={globalStyles}><UpdateDistrict /></Box>;
      case 'deleteDistrict':
        return <Box sx={globalStyles}><DeleteDistrict /></Box>;
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
                backgroundColor: "#1F2A40", // Always dark
                borderRadius: '8px',
                p: 3,
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
              }}
            >
              <h3 style={{ 
                color: '#4cceac', // Always use greenAccent
                margin: '0 0 10px 0' 
              }}>
                Total Students
              </h3>
              <p style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#e0e0e0', // Always light text
                margin: 0
              }}>
                {counts.studentCount}
              </p>
            </Box>

            <Box
              sx={{
                backgroundColor: "#1F2A40", // Always dark
                borderRadius: '8px',
                p: 3,
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
              }}
            >
              <h3 style={{ 
                color: '#6870fa',
                margin: '0 0 10px 0' 
              }}>
                Total Teachers
              </h3>
              <p style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#e0e0e0',
                margin: 0
              }}>
                {counts.teacherCount}
              </p>
            </Box>

            <Box
              sx={{
                backgroundColor: "#1F2A40",
                borderRadius: '8px',
                p: 3,
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
              }}
            >
              <h3 style={{ 
                color: '#db4f4a',
                margin: '0 0 10px 0' 
              }}>
                Total Schools
              </h3>
              <p style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#e0e0e0',
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
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      <AdminSidebar onMenuItemClick={handleMenuItemClick} currentMenuItem={selectedMenuItem} />
      
      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#141b2d',
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            backgroundColor: '#1F2A40',
            borderRadius: '8px',
            mb: 3,
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
          }}
        >
          <h1 style={{ 
            color: '#e0e0e0',
            margin: 0, 
            fontSize: '1.5rem'
          }}>
            Admin Dashboard
          </h1>
          
          <SessionTimer tokenKey="adminToken"/>
        </Box>

        {renderContent()}
      </Box>
    </Box>
  );
};

export default AdminDashboard;