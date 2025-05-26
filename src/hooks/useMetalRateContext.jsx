import { useContext } from 'react';
import { MetalRateContext } from '../context/MetalRateProvider';

const useMetalRateContext = () => useContext(MetalRateContext);
export default useMetalRateContext;
