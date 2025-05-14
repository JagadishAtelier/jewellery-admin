import { useContext } from 'react';
import { GoldRateContext } from '../context/GoldRateProvider';

const useGoldRateContext = () => useContext(GoldRateContext);

export default useGoldRateContext;
