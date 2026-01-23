import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string | React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  return (
    <div className={cn('flex space-x-1 bg-slate-100 p-1 rounded-lg', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors z-10',
              isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-md shadow-sm z-[-1]"
                transition={{
                  type: 'spring',
                  bounce: 0.2,
                  duration: 0.6,
                }}
              />
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export { Tabs };
export type { Tab, TabsProps };
