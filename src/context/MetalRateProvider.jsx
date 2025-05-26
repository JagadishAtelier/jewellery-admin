import React, { createContext, useEffect, useState } from 'react';
import { getGoldRates } from '../api/goldRateApi';
import {getSilverRates} from '../api/silverRateapi'
import {getPlatinumRates} from '../api/platinumRateApi'

export const MetalRateContext = createContext();

const MetalRateProvider = ({ children }) => {
  const [rates, setRates] = useState({
    gold: {},
    silver: {},
    platinum: {}
  });
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const [goldRes, silverRes, platinumRes] = await Promise.all([
        getGoldRates(),
        getSilverRates(),
        getPlatinumRates()
      ]);

      const goldRates = {};
      if (goldRes.status === 200) {
        goldRes.data.forEach(rate => {
          goldRates[rate.karat] = rate;
        });
      }

      const silverRates = {};
      if (silverRes.status === 200) {
        silverRes.data.forEach(rate => {
          silverRates[rate.karat] = rate;
        });
      }

      const platinumRates = {};
      if (platinumRes.status === 200) {
        platinumRes.data.forEach(rate => {
          platinumRates[rate.karat] = rate;
        });
      }

      setRates({
        gold: goldRates,
        silver: silverRates,
        platinum: platinumRates
      });

      console.log({ goldRates, silverRates, platinumRates });
    } catch (err) {
      console.error('Failed to fetch metal rates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  return (
    <MetalRateContext.Provider value={{ rates, loading, fetchRates }}>
      {children}
    </MetalRateContext.Provider>
  );
};

export default MetalRateProvider;
