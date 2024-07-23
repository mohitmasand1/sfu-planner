// LoadingOverlay.tsx
import React from 'react';
import { Spin } from 'antd';

const LoadingOverlay: React.FC = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
    <Spin size="large" />
  </div>
);

export default LoadingOverlay;
