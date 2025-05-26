import React, { useEffect, useMemo, useState } from "react";
import useGoldRateContext from "../hooks/useGoldRateContext";

const animateRate = (end, setRate, duration = 800) => {
  let start = 0;
  const startTime = performance.now();

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = start + (end - start) * progress;
    setRate(parseFloat(value.toFixed(2)));

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

const getNext8AM = () => {
  const now = new Date();
  const next = new Date();

  next.setHours(8, 0, 0, 0); // set to today 8:00 AM

  // If already past 8 AM today, move to tomorrow 8 AM
  if (now >= next) {
    next.setDate(next.getDate() + 1);
  }

  return next;
};

const formatCountdown = (ms) => {
  const totalSeconds = Math.max(Math.floor(ms / 1000), 0);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const GoldRatesDisplay = () => {
  const { rates, loading, fetchRates } = useGoldRateContext();

  const updatedAt = useMemo(() => {
    return rates['24k']?.updatedAt ? new Date(rates['24k'].updatedAt) : null;
  }, [rates]);

  const lastUpdatedStr = updatedAt
    ? `${updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${updatedAt.toLocaleDateString()}`
    : '-';

  const [rate24, setRate24] = useState(0);
  const [rate22, setRate22] = useState(0);
  const [rate18, setRate18] = useState(0);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (rates['24k']?.ratePerGram) animateRate(rates['24k'].ratePerGram, setRate24);
    if (rates['22k']?.ratePerGram) animateRate(rates['22k'].ratePerGram, setRate22);
    if (rates['18k']?.ratePerGram) animateRate(rates['18k'].ratePerGram, setRate18);
  }, [rates]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const nextUpdate = getNext8AM();
      const diff = nextUpdate - now;

      if (diff <= 0) {
        fetchRates();
      } else {
        setCountdown(formatCountdown(diff));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchRates]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-3">
        <div className="spinner-border text-warning" role="status" style={{ width: "1.5rem", height: "1.5rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2 small text-muted">Fetching live gold rates...</span>
      </div>
    );
  }

  return (
    <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-3 align-items-center small text-muted fw-medium text-center text-md-start">
      <div><span className="text-dark"><strong>Gold Rate: </strong>24k:</span> <span className="text-warning">₹{rate24 || '-'}</span></div>
      <div><span className="text-dark">22k:</span> <span className="text-warning">₹{rate22 || '-'}</span></div>
      <div><span className="text-dark">18k:</span> <span className="text-warning">₹{rate18 || '-'}</span></div>
      <div><span className="text-dark small">Updated:</span> <span className="text-success small">{lastUpdatedStr}</span></div>
      <div><span className="text-dark small">Next update in:</span> <span className="text-success small">{countdown || '-'}</span></div>
    </div>
  );
};

export default GoldRatesDisplay;
