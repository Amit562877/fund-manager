export const calculateEMI = (principal: number, rate: number, tenure: number): number => {
    if (!principal || !rate || !tenure) return 0;
    const monthlyRate = rate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
        (Math.pow(1 + monthlyRate, tenure) - 1);
    return emi;
};

export const calculateTotalInterest = (emi: number, tenure: number, principal: number): number => {
    const totalPayment = emi * tenure;
    return totalPayment - principal;
};

export const calculatePrepaymentImpact = (principal: number, prepaymentAmount: number, rate: number, tenure: number): { newEMI: number, interestSaved: number } => {
    const newPrincipal = principal - prepaymentAmount;
    const newEMI = calculateEMI(newPrincipal, rate, tenure);
    const totalInterestBefore = calculateTotalInterest(calculateEMI(principal, rate, tenure), tenure, principal);
    const totalInterestAfter = calculateTotalInterest(newEMI, tenure, newPrincipal);
    const interestSaved = totalInterestBefore - totalInterestAfter;

    return { newEMI, interestSaved };
};