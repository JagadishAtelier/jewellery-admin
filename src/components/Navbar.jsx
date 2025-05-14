import React, { useEffect, useMemo } from 'react';
import useGoldRateContext from '../hooks/useGoldRateContext';
import UserImage from '../assets/user.jpg';
import { FiMenu } from 'react-icons/fi';

const Navbar = ({ toggleSidebar }) => {
  const { rates, loading, fetchRates } = useGoldRateContext();

  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  const updatedAt = useMemo(() => {
    return rates['24k']?.updatedAt ? new Date(rates['24k'].updatedAt) : null;
  }, [rates]);

  const lastUpdatedStr = updatedAt
    ? updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '-';

  const nextInMinutes = updatedAt
    ? 60 - (Math.floor((new Date() - updatedAt) / (1000 * 60)) % 60)
    : null;

  // Auto-refresh when next update hits 0 mins
  useEffect(() => {
    if (!updatedAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now - updatedAt) / (1000 * 60));
      const remaining = 60 - (diff % 60);

      if (remaining <= 0) {
        fetchRates(); // Fetch new gold rates
      }
    }, 10000); // check every 10 seconds

    return () => clearInterval(interval);
  }, [updatedAt, fetchRates]); 
  return (
    <nav className="rounded bg-white mb-3 p-3 d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center">
        <button className="btn btn-outline-primary me-3 d-md-none" onClick={toggleSidebar}>
          <FiMenu size={20} />
        </button>

        {!loading ? (
          <div className="text-muted small fw-semibold d-flex flex-wrap align-items-center">
            <div className="me-2">Gold Price:</div>
            <div className="me-3">24k: <span className="text-primary">₹{rates['24k']?.ratePerGram?.toFixed(2) || '-'}</span></div>
            <div className="me-3">22k: <span className="text-primary">₹{rates['22k']?.ratePerGram?.toFixed(2) || '-'}</span></div>
            <div className="me-3">18k: <span className="text-primary">₹{rates['18k']?.ratePerGram?.toFixed(2) || '-'}</span></div>
            <div className="me-3 text-secondary">Last updated: <span className='text-primary fw-bold'>{lastUpdatedStr}</span></div>
            <div className="text-secondary">
              Next update in: <span className='text-primary fw-bold'>{nextInMinutes !== null ? `${nextInMinutes} min${nextInMinutes !== 1 ? 's' : ''}` : '-'}</span>
            </div>
          </div>
        ) : (
          <div className="text-muted small">Loading gold rates...</div>
        )}
      </div>

      <div className="d-flex align-items-center gap-2">
        <div className="small text-muted fw-bold d-none d-md-block">
          Date: <span className="text-primary me-3">{formattedDate}</span>
        </div>
        <img
          src={UserImage}
          alt="User"
          className="rounded-circle"
          style={{ width: '30px', height: '30px', objectFit: 'cover' }}
        />
      </div>
    </nav>
  );
};

export default Navbar;
