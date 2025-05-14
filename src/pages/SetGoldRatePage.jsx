import React, { useState } from 'react';
import { updateGoldRate } from '../api/goldRateApi';
import useGoldRateContext from '../hooks/useGoldRateContext';

export default function SetGoldRatePage() {
  const [ratesInput, setRatesInput] = useState({
    '24k': '',
    '22k': '',
    '18k': '',
  });
  const { triggerRefresh } = useGoldRateContext();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRatesInput(prevRates => ({
      ...prevRates,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ratesToUpdate = {};
    let hasInvalidRate = false;

    for (const karat in ratesInput) {
      const rate = ratesInput[karat];
      if (!rate || isNaN(rate) || parseFloat(rate) <= 0) {
        hasInvalidRate = true;
        break;
      }
      ratesToUpdate[karat] = parseFloat(rate);
    }

    if (hasInvalidRate) {
      return alert("Please enter valid gold rates for all karats.");
    }

    try {
      for (const karat in ratesToUpdate) {
        await updateGoldRate({
          karat: karat,
          ratePerGram: ratesToUpdate[karat],
        });
      }
      triggerRefresh();
      alert('Gold rates updated successfully!');
      setRatesInput({ '24k': '', '22k': '', '18k': '' });
    } catch (err) {
      console.error(err);
      alert('Failed to update gold rates');
    }
  };

  return (
    <div className="py-5 px-4">
      <div className="container bg-white p-4 rounded shadow">
        <h2 className='fw-bold'>Set Gold Rates</h2>
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="mb-3">
            <label htmlFor="24kRate" className="form-label fw-semibold">24k gold ₹ per gram</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              id="24kRate"
              name="24k"
              placeholder="eg: 9564.35"
              value={ratesInput['24k']}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="22kRate" className="form-label fw-semibold">22k gold ₹ per gram</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              id="22kRate"
              name="22k"
              placeholder="eg: 8864.35"
              value={ratesInput['22k']}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="18kRate" className="form-label fw-semibold">18k gold ₹ per gram</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              id="18kRate"
              name="18k"
              placeholder="eg: 8564.35"
              value={ratesInput['18k']}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary">Update All Rates</button>
        </form>
      </div>
    </div>
  );
}
