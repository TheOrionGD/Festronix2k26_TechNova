import { useContext } from 'react';
import { AppContext } from './AppContextObject';

export const useApp = () => useContext(AppContext);
