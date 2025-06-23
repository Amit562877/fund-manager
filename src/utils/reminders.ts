import { ChecklistItem } from '../types/checklist';

export const checkForOverdueItems = (checklistItems: ChecklistItem[]): ChecklistItem[] => {
  const today = new Date();
  return checklistItems.filter(item => {
    const dueDate = new Date(item.dueDate);
    return dueDate < today && !item.done;
  });
};

export const sendReminder = (overdueItems: ChecklistItem[]): void => {
  overdueItems.forEach(item => {
    console.log(`Reminder: The task "${item.title}" is overdue!`);
  });
};

export const markItemAsDone = (item: ChecklistItem): ChecklistItem => {
  return { ...item, done: true };
};