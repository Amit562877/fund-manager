import React from 'react';
import ChecklistItem from './ChecklistItem';
import { useChecklistStore } from '../store/checklistStore';

const ChecklistManager: React.FC = () => {
  const {
    checklists,
    addChecklist,
    setChecklistItemDone,
    addChecklistItem,
  } = useChecklistStore();

  const [newChecklist, setNewChecklist] = React.useState('');
  const [frequency, setFrequency] = React.useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [newItem, setNewItem] = React.useState<{ [key: string]: string }>({});

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Checklist Manager</h2>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newChecklist}
          onChange={(e) => setNewChecklist(e.target.value)}
          placeholder="New Checklist Title"
          className="border p-2 rounded flex-1"
        />
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as any)}
          className="border p-2 rounded"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <button
          onClick={() => {
            if (newChecklist.trim()) {
              addChecklist(newChecklist, frequency);
              setNewChecklist('');
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>
      <div className="space-y-6">
        {checklists.map(checklist => (
          <div key={checklist.id} className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">{checklist.title} <span className="text-xs text-gray-500">({checklist.frequency})</span></h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newItem[checklist.id] || ''}
                onChange={e => setNewItem({ ...newItem, [checklist.id]: e.target.value })}
                placeholder="Add item"
                className="border p-2 rounded flex-1"
              />
              <button
                className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                onClick={() => {
                  if ((newItem[checklist.id] || '').trim()) {
                    addChecklistItem(checklist.id, newItem[checklist.id]);
                    setNewItem({ ...newItem, [checklist.id]: '' });
                  }
                }}
              >
                Add
              </button>
            </div>
            <ul>
              {checklist.items.map(item => (
                <li key={item.id} className="flex items-center justify-between py-1">
                  <span className={item.done ? "line-through text-gray-400" : ""}>{item.title}</span>
                  <button
                    className={`ml-2 px-2 py-1 rounded text-xs ${item.done ? "bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                    disabled={item.done}
                    onClick={() => setChecklistItemDone(checklist.id, item.id)}
                  >
                    {item.done ? "Done" : "Mark Done"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChecklistManager;