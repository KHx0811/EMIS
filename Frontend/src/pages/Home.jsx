import React from 'react';
import Navbar from '../Components/Navbar';
import BgImage from '../Components/BgImage';

const Home = () => {
  const contentStyle = {
    position: 'relative',
    zIndex: 1,
    padding: '5px',
    marginTop: '0px',
  };

  return (
    <div>
      <Navbar />
      <BgImage />
      <div style={contentStyle}>
        <h1>Empowering Education with Smart Data Management</h1>
        <p style={{ fontSize: '22px', lineHeight: '2.0' }}>
          Welcome to EduNexus, a cutting-edge Education Management Information System (EMIS) designed to streamline academic operations and enhance decision-making. Our platform provides a secure, efficient, and data-driven approach to managing student records, faculty details, attendance, assessments, and more.
          <br />
          <br />
          With advanced features like blockchain security for data integrity and machine learning insights, we ensure that institutions stay ahead in the digital education era. Whether you are an administrator, teacher, or student, our EduNexus offers a seamless experience to make education management smarter and more effective.
        </p>
      </div>
    </div>
  );
};

export default Home;
