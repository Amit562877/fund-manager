export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  done: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  items: ChecklistItem[];
}