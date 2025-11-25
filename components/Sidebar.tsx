
import React from 'react';
import { BackpackIcon, QuestIcon } from './IconComponents';

interface SidebarProps {
  inventory: string[];
  quest: string;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ inventory, quest, className }) => {
  return (
    <aside className={`flex-shrink-0 ${className}`}>
      <div className="sticky top-8 bg-brand-surface rounded-lg shadow-2xl p-6 space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center font-serif text-brand-secondary">
            <BackpackIcon className="w-6 h-6 mr-3" />
            Inventory
          </h2>
          <ul className="space-y-2 text-brand-text-muted">
            {inventory.length > 0 ? (
              inventory.map((item, index) => (
                <li key={index} className="pl-4 border-l-2 border-brand-primary">
                  {item}
                </li>
              ))
            ) : (
              <li className="pl-4 italic">Your pockets are empty.</li>
            )}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center font-serif text-brand-secondary">
            <QuestIcon className="w-6 h-6 mr-3" />
            Current Quest
          </h2>
          <p className="text-brand-text-muted pl-4 border-l-2 border-brand-primary">
            {quest}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
