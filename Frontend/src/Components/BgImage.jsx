import React from 'react';
import { assets } from '../assets/assets';

const BgImage = () => {
  const bgImageStyle = {
    position: 'absolute',
    top: '60px',
    left: 0,
    width: '100%',
    height: 'calc(100vh - 60px)', // Full view height minus the navbar height
    backgroundImage: `url(${assets.bg_image})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    opacity: 0.2,
    zIndex: -1,
  };

  return <div style={bgImageStyle}></div>;
};

export default BgImage;
