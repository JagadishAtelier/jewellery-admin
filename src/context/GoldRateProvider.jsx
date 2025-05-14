import React, { createContext, useEffect, useState } from 'react';
import { getGoldRates } from '../api/goldRateApi';

export const GoldRateContext = createContext();

const GoldRateProvider = ({ children }) => {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const data = await getGoldRates();
      const formattedRates = {};
      if (data.status === 200) {
        data.data.forEach(rate => {
          formattedRates[rate.karat] = rate;
        });
      }
      setRates(formattedRates);
      console.log(formattedRates);
    } catch (err) {
      console.error('Failed to fetch gold rates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  return (
    <GoldRateContext.Provider value={{ rates, loading, fetchRates }}>
      {children}
    </GoldRateContext.Provider>
  );
};

export default GoldRateProvider;

