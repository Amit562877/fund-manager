import React from 'react';
import { ChecklistItem as ChecklistItemType } from '../types/checklist';

interface ChecklistItemProps {
  item: ChecklistItemType;
  onMarkAsDone: () => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onMarkAsDone }) => {
  const handleToggle = () => {
    onMarkAsDone();
  };

  return (
    <div className={`flex items-center justify-between p-4 border-b ${item.done ? 'bg-green-100' : 'bg-white'}`}>
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={item.done}
          onChange={handleToggle}
          className="mr-2"
        />
        <span className={`text-lg ${item.done ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {item.title}
        </span>
      </div>
      <span className="text-sm text-gray-500">
        {item.dueDate ? item.dueDate.toLocaleDateString() : ''}
      </span>
    </div>
  );
};

export default ChecklistItem;