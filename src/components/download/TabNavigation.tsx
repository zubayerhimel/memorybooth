import { LayoutList, Palette, Play } from 'lucide-react';

type TabType = 'layout' | 'template' | 'gif';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  const tabs = [
    { id: 'layout' as TabType, icon: <LayoutList className="w-4 h-4" />, label: 'Layout' },
    { id: 'template' as TabType, icon: <Palette className="w-4 h-4" />, label: 'Theme' },
    { id: 'gif' as TabType, icon: <Play className="w-4 h-4" />, label: 'GIF' },
  ];

  return (
    <div className="flex border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-primary/10 text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:bg-secondary/50'
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
