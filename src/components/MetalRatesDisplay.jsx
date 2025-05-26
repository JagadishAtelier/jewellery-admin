import React, { useEffect, useMemo, useState } from "react";
import useMetalRateContext from "../hooks/useMetalRateContext";

const animateRate = (end, setRate, duration = 800) => {
  let start = 0;
  const startTime = performance.now();

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = start + (end - start) * progress;
    setRate(parseFloat(value.toFixed(2)));
    if (progress < 1) requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
};

const getNext8AM = () => {
  const now = new Date();
  const next = new Date();
  next.setHours(8, 0, 0, 0);
  if (now >= next) next.setDate(next.getDate() + 1);
  return next;
};

const formatCountdown = (ms) => {
  const totalSeconds = Math.max(Math.floor(ms / 1000), 0);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const MetalRatesDisplay = () => {
  const { rates, loading, fetchRates } = useMetalRateContext();
  const [animatedRates, setAnimatedRates] = useState({});
  const [countdown, setCountdown] = useState('');
  const [currentMetalIndex, setCurrentMetalIndex] = useState(0);

  const metals = useMemo(() => Object.keys(rates), [rates]);

  const updatedAt = useMemo(() => {
    return rates.gold?.['24k']?.updatedAt ? new Date(rates.gold['24k'].updatedAt) : null;
  }, [rates]);

  const lastUpdatedStr = updatedAt
    ? `${updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${updatedAt.toLocaleDateString()}`
    : '-';

  // Animate rates
  useEffect(() => {
    Object.entries(rates).forEach(([metal, karats]) => {
      Object.entries(karats).forEach(([karat, rate]) => {
        const key = `${metal}-${karat}`;
        animateRate(rate.ratePerGram, (val) => {
          setAnimatedRates((prev) => ({ ...prev, [key]: val }));
        });
      });
    });
  }, [rates]);

  // Countdown to 8 AM
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

  // Rotate metal every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetalIndex((prev) => (prev + 1) % metals.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [metals]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-3">
        <div className="spinner-border text-warning" role="status" style={{ width: "1.5rem", height: "1.5rem" }} />
        <span className="ms-2 small text-muted">Fetching live metal rates...</span>
      </div>
    );
  }

  const metal = metals[currentMetalIndex];
  const karats = rates[metal] || {};

  return (
    <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-3 align-items-center small text-muted fw-medium text-center text-md-start">
      <div>
        <span className="text-dark text-uppercase small"><strong>{metal} Rate:</strong></span>
      </div>
      {Object.entries(karats).map(([karat]) => (
        <div key={karat}>
          <span className="text-dark small">{karat}:</span>{' '}
          <span className="text-warning small">₹{animatedRates[`${metal}-${karat}`] || '-'}</span>
        </div>
      ))}
      <div>
        <span className="text-dark small">Updated:</span>{' '}
        <span className="text-success small">{lastUpdatedStr}</span>
      </div>
      <div>
        <span className="text-dark small">Next update in:</span>{' '}
        <span className="text-success small">{countdown || '-'}</span>
      </div>
    </div>
  );
};

export default MetalRatesDisplay;
