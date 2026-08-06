import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export default function SsoRedirectPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/login');
  }, [navigate]);
  return <div>Redirecting...</div>;
}
