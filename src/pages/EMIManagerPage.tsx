'use client';

import React from 'react';
import EMIManager from '../components/EMIManager';
import { useAppStore } from '../store/useAppStore';

const EMIPage = () => {
  const emis = useAppStore((s) => s.emis);
  const setEMIs = useAppStore((s) => s.setEMIs);

  return (
    <div className="p-6">
      <EMIManager emis={emis} setEMIs={setEMIs} />
    </div>
  );
};

export default EMIPage;
