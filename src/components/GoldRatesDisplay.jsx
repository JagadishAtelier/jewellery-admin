import React, { useEffect, useMemo } from "react";
import useGoldRateContext from "../hooks/useGoldRateContext";

const GoldRatesDisplay = () => {
  const { rates, loading, fetchRates } = useGoldRateContext();

  const updatedAt = useMemo(() => {
    return rates['24k']?.updatedAt ? new Date(rates['24k'].updatedAt) : null;
  }, [rates]);

  const lastUpdatedStr = updatedAt
    ? updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '-';

  const nextInMinutes = updatedAt
    ? 60 - (Math.floor((new Date() - updatedAt) / (1000 * 60)) % 60)
    : null;

  useEffect(() => {
    if (!updatedAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now - updatedAt) / (1000 * 60));
      const remaining = 60 - (diff % 60);

      if (remaining <= 0) {
        fetchRates();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [updatedAt, fetchRates]);

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
  <div><span className="text-dark">24k:</span> <span className="text-warning">₹{rates['24k']?.ratePerGram?.toFixed(2) || '-'}</span></div>
  <div><span className="text-dark">22k:</span> <span className="text-warning">₹{rates['22k']?.ratePerGram?.toFixed(2) || '-'}</span></div>
  <div><span className="text-dark">18k:</span> <span className="text-warning">₹{rates['18k']?.ratePerGram?.toFixed(2) || '-'}</span></div>
  <div><span className="text-dark">Updated:</span> <span className="text-success">{lastUpdatedStr}</span></div>
  <div><span className="text-dark">Next update:</span> <span className="text-muted">{nextInMinutes !== null ? `${nextInMinutes} min${nextInMinutes !== 1 ? 's' : ''}` : '-'}</span></div>
</div>

  );
};

export default GoldRatesDisplay;
