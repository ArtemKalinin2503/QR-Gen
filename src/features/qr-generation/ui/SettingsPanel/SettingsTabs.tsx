import React from "react";
import type { SettingsTabKey } from "../../model/types";
import {
  IconSettings,
  IconStylesQr,
  IconLogo,
  IconBackground,
  IconSignature,
} from "../../../../shared/ui/icons";

type TabConfig = {
  key: SettingsTabKey;
  title: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number }>;
};

const tabs: TabConfig[] = [
  { key: "basic", title: "Основные параметры", Icon: IconSettings },
  { key: "styles", title: "Стили", Icon: IconStylesQr },
  { key: "logo", title: "Логотип", Icon: IconLogo },
  { key: "background", title: "Фон", Icon: IconBackground },
  { key: "signature", title: "Подпись", Icon: IconSignature },
];

type SettingsTabsProps = {
  activeTab: SettingsTabKey;
  onTabChange: (tab: SettingsTabKey) => void;
};

export const SettingsTabs = ({ activeTab, onTabChange }: SettingsTabsProps) => (
  <div className="flex items-center gap-10 border-b border-brand-100 pb-5">
    {tabs.map((tab) => {
      const isActive = tab.key === activeTab;

      return (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
          className={[
            "relative inline-flex items-center gap-[5px]",
            "text-[13px] font-semibold",
            isActive ? "text-brand-500" : "text-brand-400",
          ].join(" ")}
        >
          <tab.Icon
            size={20}
            className={isActive ? "text-brand-500" : "text-brand-400"}
          />

          {tab.title}

          <span
            className={[
              "absolute -bottom-5 left-0 h-[3px] w-full rounded-full bg-brand-500",
              isActive ? "opacity-100" : "opacity-0",
            ].join(" ")}
          />
        </button>
      );
    })}
  </div>
);
