import React from 'react'
import { Routes, Route } from 'react-router-dom'
import SelectUser from './pages/SelectUser'
import Home from './pages/Home'
import AdminLogin from './pages/AdminLogin'
import ParentLogin from './pages/ParentLogin'
import TeacherLogin from './pages/TeacherLogin'
import PrincipalLogin from './pages/PrincipalLogin'
import DistrictLogin from './pages/DistrictLogin'
import ResetPassword from './pages/ResetPassword'
import SendResetOtp from './pages/SendResetOtp'
import StudentDashboard from './pages/Dashboards/StudentDashboard'
import TeacherDashboard from './pages/Dashboards/TeacherDashboard'
import ParentDashboard from './pages/Dashboards/ParentDashboard'
import PrincipalDashboard from './pages/Dashboards/PrincipalDashboard'
import DistrictDashboard from './pages/Dashboards/DistrictDashboard'
import AdminDashboard from './pages/Dashboards/AdminDashboard'
import AdminSignup from './pages/AdminSignup'
import ProtectedRoute from './Components/ProtectedRoute'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/selectuser" element={<SelectUser />} />
        <Route path="/adminsignup" element={<AdminSignup />} />
        <Route path="/login/parent" element={<ParentLogin />} />
        <Route path="/login/teacher" element={<TeacherLogin />} />
        <Route path="/login/district" element={<DistrictLogin />} />
        <Route path="/login/principal" element={<PrincipalLogin />} />
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/getresetpasswordotp" element={<SendResetOtp />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path='/dashboard/student' element={<StudentDashboard />} />
        <Route path='/dashboard/teacher' element={<TeacherDashboard />} />
        <Route path='/dashboard/parent' element={<ParentDashboard />} />
        <Route path='/dashboard/principal' element={<PrincipalDashboard />} />
        <Route path='/dashboard/districthead' element={<DistrictDashboard />} />
        <Route path='/dashboard/admin' element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default App
