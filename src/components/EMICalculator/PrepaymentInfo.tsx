import React from 'react';

const PrepaymentInfo: React.FC = () => {
  return (
    <div>
      <h2>Understanding Prepayment</h2>
      <p>
        Prepayment refers to the act of paying off a loan before its scheduled due date. Making a prepayment can significantly reduce the total interest paid over the life of the loan.
      </p>
      <h3>Benefits of Prepayment</h3>
      <ul>
        <li>Reduces the principal amount, leading to lower interest costs.</li>
        <li>Shortens the loan tenure, allowing you to be debt-free sooner.</li>
        <li>Improves your credit score by reducing your overall debt burden.</li>
      </ul>
      <h3>How Prepayment Affects Your Loan</h3>
      <p>
        When you make a prepayment, the amount is deducted from your principal balance. This means that the interest for the remaining tenure is calculated on a lower principal amount, resulting in savings on interest payments.
      </p>
      <h3>Calculate Your Savings</h3>
      <p>
        To understand how much you can save by making a prepayment, consider the following:
      </p>
      <ul>
        <li>Determine your current loan balance.</li>
        <li>Calculate the interest rate and remaining tenure.</li>
        <li>Estimate the amount you plan to prepay.</li>
      </ul>
      <p>
        Using these figures, you can calculate the potential savings on interest payments and the impact on your loan tenure.
      </p>
    </div>
  );
};

export default PrepaymentInfo;