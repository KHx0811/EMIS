// import React, { useContext, useState, useEffect } from 'react';
// import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
// import { LogOut } from 'lucide-react';
// import { Box, useTheme, Typography } from '@mui/material';
// import { ColorModeContext, tokens } from '../assets/theme';
// import axios from 'axios';

// const AdminSidebar = ({ onMenuItemClick }) => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);
//   const colorMode = useContext(ColorModeContext);
//   const [adminName, setAdminName] = useState('Admin');

//   const fetchUserDetails = async () => {
//     try {
//       const token = localStorage.getItem('adminToken'); // Assuming the token is stored in localStorage
//       const response = await axios.get('http://localhost:3000/api/users/details', {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       setAdminName(response.data.data.username);
//     } catch (error) {
//       console.error('Error fetching user details:', error);
//     }
//   };

//   useEffect(() => {
//     fetchUserDetails();
//   }, []);

//   return (
//     <Box
//       sx={{
//         position: 'relative',
//         height: '100vh',
//         backgroundColor: '#0f1322', // Dark navy background
//         boxShadow: '2px 0px 10px rgba(0, 0, 0, 0.3)'
//       }}
//     >
//       <Sidebar
//         rootStyles={{
//           height: '100%',
//           border: 'none',
//           backgroundColor: '#0f1322',
//           position: 'relative',
//           color: '#ffffff'
//         }}
//         width="220px"
//       >
//         <Box sx={{
//           padding: '20px 15px',
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           borderBottom: '1px solid rgba(255,255,255,0.1)'
//         }}>
//           <Box sx={{ textAlign: 'center' }}>
//             <Typography variant="h6" sx={{ color: '#ffffff', margin: '8px 0 0 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
//               {adminName}
//             </Typography>
//             <Typography variant="body2" sx={{ color: '#00deb6', margin: '2px 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
//               Admin
//             </Typography>
//           </Box>
//         </Box>

//         <Box sx={{ mt: 2 }}>
//           <Menu
//             menuItemStyles={{
//               button: ({ level, active }) => ({
//                 color: '#ffffff',
//                 backgroundColor: active ? 'rgba(0, 222, 182, 0.2)' : 'transparent',
//                 margin: '4px 8px',
//                 borderRadius: '6px',
//                 '&:hover': {
//                   backgroundColor: 'rgba(0, 222, 182, 0.1)',
//                   color: '#00deb6',
//                 }
//               }),
//               icon: {
//                 color: '#00deb6'
//               },
//               subMenuContent: {
//                 backgroundColor: '#131b2e'
//               }
//             }}
//           >
//             <SubMenu
//               label="Students"
//               icon={<span style={{ fontSize: '1.2rem', marginRight: '8px' }}>👨‍🎓</span>}
//             >
//               <MenuItem onClick={() => onMenuItemClick('createStudent')}>Create Student</MenuItem>
//               <MenuItem onClick={() => onMenuItemClick('studentList')}>Student List</MenuItem>
//               <MenuItem onClick={() => onMenuItemClick('updateStudent')}>Update Student</MenuItem>
//               <MenuItem onClick={() => onMenuItemClick('deleteStudent')}>Delete Student</MenuItem>
//             </SubMenu>

//             <SubMenu
//               label="Parents"
//               icon={<span style={{ fontSize: '1.2rem', marginRight: '8px' }}>👪</span>}
//             >
//               <MenuItem onClick={() => onMenuItemClick('createParent')}>Create Parent</MenuItem>
//               <MenuItem onClick={() => onMenuItemClick('parentList')}>Parent List</MenuItem>
//               <MenuItem onClick={() => onMenuItemClick('updateParent')}>Update Parent</MenuItem>
//               <MenuItem onClick={() => onMenuItemClick('deleteParent')}>Delete Parent</MenuItem>
//             </SubMenu>

//             <SubMenu
//               label="Teachers"
//               icon={<span style={{ fontSize: '1.2rem', marginRight: '8px' }}>👩‍🏫</span>}
//             >
//               <MenuItem onClick={() => onMenuItemClick('createTeacher')}>Create Teacher</MenuItem>
//               <MenuItem onClick={() => onMenuItemClick('teacherList')}>Teacher List</MenuItem>
//               <MenuItem onClick={() => onMenuItemClick('updateTeacher')}>Update Teacher</MenuItem>
//               <MenuItem onClick={() => onMenuItemClick('deleteTeacher')}>Delete Teacher</MenuItem>
//             </SubMenu>

//             <SubMenu
//               label="Schools"
//               icon={<span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🏫</span>}
//             >
//               <MenuItem onClick={() => onMenuItemClick('createSchool')}>Create School</MenuItem>
//               <MenuItem onClick={() => onMenuItemClick('schoolList')}>School List</MenuItem>
//               <MenuItem onClick={() => onMenuItemClick('updateSchool')}>Update School</MenuItem>
//               <MenuItem onClick={() => onMenuItemClick('deleteSchool')}>Delete School</MenuItem>
//             </SubMenu>

//             <SubMenu
//               label="Districts"
//               icon={<span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🏢</span>}
//             >
//               <MenuItem onClick={() => onMenuItemClick('createDistrict')}>Create District</MenuItem>
//               <MenuItem onClick={() => onMenuItemClick('districtList')}>District List</MenuItem>
//               <MenuItem onClick={() => onMenuItemClick('updateDistrict')}>Update District</MenuItem>
//               <MenuItem onClick={() => onMenuItemClick('deleteDistrict')}>Delete District</MenuItem>
//             </SubMenu>
//           </Menu>
//         </Box>
//       </Sidebar>

//       {/* Logout button at the bottom */}
//       <Box
//         sx={{
//           position: 'absolute',
//           bottom: 0,
//           left: 0,
//           width: '100%',
//           borderTop: '1px solid rgba(255,255,255,0.1)',
//         }}
//       >
//         <button
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             width: '100%',
//             padding: '12px 16px',
//             backgroundColor: 'rgba(0, 222, 182, 0.1)',
//             color: '#00deb6',
//             border: 'none',
//             cursor: 'pointer',
//             fontWeight: 'bold'
//           }}
//         >
//           <LogOut size={18} style={{ marginRight: '8px' }} />
//           Logout
//         </button>
//       </Box>
//     </Box>
//   );
// };

// export default AdminSidebar;

import React, { useContext, useState, useEffect } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { LogOut } from 'lucide-react';
import { Box, useTheme, Typography } from '@mui/material';
import { ColorModeContext, tokens } from '../assets/theme';
import axios from 'axios';

const AdminSidebar = ({ onMenuItemClick }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const adminName = 'John Doe'; // Random name assigned

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        backgroundColor: '#0f1322', // Dark navy background
        boxShadow: '2px 0px 10px rgba(0, 0, 0, 0.3)'
      }}
    >
      <Sidebar
        rootStyles={{
          height: '100%',
          border: 'none',
          backgroundColor: '#0f1322',
          position: 'relative',
          color: '#ffffff'
        }}
        width="220px"
      >
        <Box sx={{
          padding: '20px 15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#ffffff', margin: '8px 0 0 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {adminName}
            </Typography>
            <Typography variant="body2" sx={{ color: '#00deb6', margin: '2px 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
              Admin
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Menu
            menuItemStyles={{
              button: ({ level, active }) => ({
                color: '#ffffff',
                backgroundColor: active ? 'rgba(0, 222, 182, 0.2)' : 'transparent',
                margin: '4px 8px',
                borderRadius: '6px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 222, 182, 0.1)',
                  color: '#00deb6',
                }
              }),
              icon: {
                color: '#00deb6'
              },
              subMenuContent: {
                backgroundColor: '#131b2e'
              }
            }}
          >
            <SubMenu
              label="Students"
              icon={<span style={{ fontSize: '1.2rem', marginRight: '8px' }}>👨‍🎓</span>}
            >
              <MenuItem onClick={() => onMenuItemClick('createStudent')}>Create Student</MenuItem>
              <MenuItem onClick={() => onMenuItemClick('studentList')}>Student List</MenuItem>
              <MenuItem onClick={() => onMenuItemClick('updateStudent')}>Update Student</MenuItem>
              <MenuItem onClick={() => onMenuItemClick('deleteStudent')}>Delete Student</MenuItem>
            </SubMenu>

            <SubMenu
              label="Parents"
              icon={<span style={{ fontSize: '1.2rem', marginRight: '8px' }}>👪</span>}
            >
              <MenuItem onClick={() => onMenuItemClick('createParent')}>Create Parent</MenuItem>
              <MenuItem onClick={() => onMenuItemClick('parentList')}>Parent List</MenuItem>
              <MenuItem onClick={() => onMenuItemClick('updateParent')}>Update Parent</MenuItem>
              <MenuItem onClick={() => onMenuItemClick('deleteParent')}>Delete Parent</MenuItem>
            </SubMenu>

            <SubMenu
              label="Teachers"
              icon={<span style={{ fontSize: '1.2rem', marginRight: '8px' }}>👩‍🏫</span>}
            >
              <MenuItem onClick={() => onMenuItemClick('createTeacher')}>Create Teacher</MenuItem>
              <MenuItem onClick={() => onMenuItemClick('teacherList')}>Teacher List</MenuItem>
              <MenuItem onClick={() => onMenuItemClick('updateTeacher')}>Update Teacher</MenuItem>
              <MenuItem onClick={() => onMenuItemClick('deleteTeacher')}>Delete Teacher</MenuItem>
            </SubMenu>

            <SubMenu
              label="Schools"
              icon={<span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🏫</span>}
            >
              <MenuItem onClick={() => onMenuItemClick('createSchool')}>Create School</MenuItem>
              <MenuItem onClick={() => onMenuItemClick('schoolList')}>School List</MenuItem>
              <MenuItem onClick={() => onMenuItemClick('updateSchool')}>Update School</MenuItem>
              <MenuItem onClick={() => onMenuItemClick('deleteSchool')}>Delete School</MenuItem>
            </SubMenu>

            <SubMenu
              label="Districts"
              icon={<span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🏢</span>}
            >
              <MenuItem onClick={() => onMenuItemClick('createDistrict')}>Create District</MenuItem>
              <MenuItem onClick={() => onMenuItemClick('districtList')}>District List</MenuItem>
              <MenuItem onClick={() => onMenuItemClick('updateDistrict')}>Update District</MenuItem>
              <MenuItem onClick={() => onMenuItemClick('deleteDistrict')}>Delete District</MenuItem>
            </SubMenu>
          </Menu>
        </Box>
      </Sidebar>

      {/* Logout button at the bottom */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '12px 16px',
            backgroundColor: 'rgba(0, 222, 182, 0.1)',
            color: '#00deb6',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          <LogOut size={18} style={{ marginRight: '8px' }} />
          Logout
        </button>
      </Box>
    </Box>
  );
};

export default AdminSidebar;