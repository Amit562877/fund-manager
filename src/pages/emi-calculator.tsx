import React from 'react';
import EMICalculator from '../components/EMICalculator';
import PrepaymentInfo from '../components//EMICalculator/PrepaymentInfo';

const EMICalculatorPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1>EMI Calculator</h1>
      <EMICalculator />
      <PrepaymentInfo />
    </div>
  );
};

export default EMICalculatorPage;