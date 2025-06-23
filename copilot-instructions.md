# Copilot Instructions for Finance Tracker App

## 🔧 Tech Stack
- ReactJS with JSX
- TypeScript
- Tailwind CSS for styling
- Firebase for auth and data (use Firestore)
- lucide-react for icons

## 🎯 Features to Support

### 1. Authentication
- Mobile number-based login/signup using OTP
- Password-based login/signup option
- Use Firebase Authentication for both methods

### 2. Dashboard
- Show summary cards:
  - Total Income
  - Total Expense
  - Loans Given / Received
  - Active EMIs
  - Monthly Budget Utilization
- Use charts (basic) for income vs expense, loan stats

### 3. Expense Tracker
- Add/edit/delete expenses
- Filter by category and date
- Tag with notes and optional images
- Categorize (Food, Rent, Bills, Travel, etc.)

### 4. Loan & EMI Tracker
- Ability to create loan records (given/received)
- Mark loans as:
  - With interest
  - Without interest
- EMI generation and status tracking
- Interest calculations (simple and compound)
- Add reminders for due dates (using Firebase Cloud Messaging or local reminders)

### 5. Khatabook-Style Ledger
- Maintain user-wise borrow/lend history
- Attach notes to each entry
- Sort by contact or date
- Show outstanding balances

### 6. Budget Tracker
- Monthly budget planning
- Visual indicators if budget exceeds
- Track remaining budget in real time

## 🧠 Design Principles
- Components should be **reusable**, **typed**, and **modular**
- Prefer **Tailwind utility classes** over custom CSS
- Use **React hooks** for state and side effects
- Icons must be from `lucide-react`

## 🚫 Avoid
- No class-based components
- Do not use other UI libraries (e.g., Material UI, Bootstrap)
- No jQuery or DOM manipulation outside React

## ✅ Best Practices
- Keep all form components controlled
- Use TypeScript interfaces for props and data models
- Use `useReducer` for complex state management
- Firebase Firestore queries must be typed and secured
- Optimize all inputs for mobile usage

