import React from 'react';
import '../../styles/Loading.css';

const Loading = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'loading-small',
    medium: 'loading-medium',
    large: 'loading-large',
  };

  return (
    <div className="loading-container">
      <div className={`loading-spinner ${sizeClasses[size]}`}></div>
      {text && (
        <p className="loading-text">{text}</p>
      )}
    </div>
  );
};

export default Loading;
