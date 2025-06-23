import React, { useState, useEffect } from 'react';
import ChecklistItem from './ChecklistItem';
import { Checklist, ChecklistItem as ChecklistItemType } from '../types/checklist';
import { checkForOverdueItems } from '../utils/reminders';

export interface ChecklistItemProps {
  item: ChecklistItemType;
  onMarkAsDone: () => void;
}
const ChecklistManager: React.FC = () => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [newChecklist, setNewChecklist] = useState<string>('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  const addChecklist = () => {
    if (newChecklist.trim()) {
      const checklist: Checklist = {
        id: Date.now().toString(),
        title: newChecklist,
        frequency,
        items: [],
      };
      setChecklists([...checklists, checklist]);
      setNewChecklist('');
    }
  };

  const markItemAsDone = (checklistId: string, itemId: string) => {
    setChecklists(checklists.map(checklist => {
      if (checklist.id === checklistId) {
        return {
          ...checklist,
          items: checklist.items.map(item => 
            item.id === itemId ? { ...item, done: true } : item
          ),
        };
      }
      return checklist;
    }));
  };

  useEffect(() => {
    const allItems = checklists.flatMap(cl => cl.items);
    const overdueItems = checkForOverdueItems(allItems);
    if (overdueItems.length > 0) {
      alert(`You have overdue items: ${overdueItems.map(item => item.title).join(', ')}`);
    }
  }, [checklists]);

  return (
    <div className="checklist-manager">
      <h2 className="text-2xl font-bold">Checklist Manager</h2>
      <div className="add-checklist">
        <input
          type="text"
          value={newChecklist}
          onChange={(e) => setNewChecklist(e.target.value)}
          placeholder="New Checklist Title"
          className="border p-2"
        />
        <select value={frequency} onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')} className="border p-2">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <button onClick={addChecklist} className="bg-blue-600 text-white p-2">Add Checklist</button>
      </div>
      <div className="checklist-list">
        {checklists.map(checklist => (
          <div key={checklist.id} className="checklist">
            <h3 className="font-semibold">{checklist.title} ({checklist.frequency})</h3>
            <div className="checklist-items">
              {checklist.items.map(item => (
                <ChecklistItem 
                  key={item.id} 
                  item={item} 
                  onMarkAsDone={() => markItemAsDone(checklist.id, item.id)} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChecklistManager;