// frontend/src/components/Loading.jsx
import React from 'react';

const Loading = ({ type = 'fixed', title = 'Memuat data...' }) => {
  return (
    <div className={`loading-wrapper loading-${type}`}>
      <div className="loading-spinner-container">
        <div className="loading"></div>
        <div className="loading-glow"></div>
      </div>
      {title && <p className="loading-title">{title}</p>}
    </div>
  );
};

export default Loading;
