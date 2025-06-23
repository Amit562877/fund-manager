import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Checklist, ChecklistItem } from '../types/checklist';

interface ChecklistState {
  checklists: Checklist[];
  addChecklist: (title: string, frequency: Checklist['frequency']) => void;
  addChecklistItem: (checklistId: string, title: string) => void;
  setChecklistItemDone: (checklistId: string, itemId: string) => void;
}

export const useChecklistStore = create<ChecklistState>()(
  persist(
    (set) => ({
      checklists: [],
      addChecklist: (title, frequency) =>
        set(state => ({
          checklists: [
            ...state.checklists,
            {
              id: Date.now().toString(),
              title,
              frequency,
              items: [],
            },
          ],
        })),
      addChecklistItem: (checklistId, itemTitle) =>
        set(state => ({
          checklists: state.checklists.map(cl =>
            cl.id === checklistId
              ? {
                  ...cl,
                  items: [
                    ...cl.items,
                    {
                      id: Date.now().toString(),
                      title: itemTitle,
                      done: false,
                      completed: false,
                      dueDate: new Date(),
                    },
                  ],
                }
              : cl
          ),
        })),
      setChecklistItemDone: (checklistId, itemId) =>
        set(state => ({
          checklists: state.checklists.map(cl =>
            cl.id === checklistId
              ? {
                  ...cl,
                  items: cl.items.map(item =>
                    item.id === itemId ? { ...item, done: true } : item
                  ),
                }
              : cl
          ),
        })),
    }),
    {
      name: 'checklist-storage', // localStorage key
    }
  )
);