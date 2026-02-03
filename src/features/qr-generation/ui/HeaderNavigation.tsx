import React from "react";
import {
  IconDownloadRegistry,
  IconGenerationQr,
  IconBusinessCard,
  IconSectionText,
  IconEmail,
} from "../../../shared/ui/icons";

type HeaderTabKey =
  | "registry"
  | "individual"
  | "businessCard"
  | "text"
  | "email";

type HeaderTabConfig = {
  key: HeaderTabKey;
  title: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number }>;
};

const headerTabs: HeaderTabConfig[] = [
  { key: "registry", title: "Загрузка реестра", Icon: IconDownloadRegistry },
  { key: "individual", title: "Индивидуальный QR-код", Icon: IconGenerationQr },
  { key: "businessCard", title: "Визитка", Icon: IconBusinessCard },
  { key: "text", title: "Текст", Icon: IconSectionText },
  { key: "email", title: "E-mail", Icon: IconEmail },
];

type HeaderNavigationProps = {
  activeTab: HeaderTabKey;
  onTabChange: (tab: HeaderTabKey) => void;
};

export const HeaderNavigation = ({
  activeTab,
  onTabChange,
}: HeaderNavigationProps) => {
  return (
    <header className="rounded-[10px] bg-white p-[20px] shadow-card">
      <nav className="flex h-full items-center gap-5">
        {headerTabs.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={[
                "inline-flex items-center justify-center",
                "rounded-[10px] px-5 py-[15px]",
                "text-[14px] font-semibold",
                "gap-2",
                isActive ? "bg-brand-500 text-white" : "text-brand-500",
              ].join(" ")}
            >
              <tab.Icon
                size={24}
                className={isActive ? "text-white" : "text-brand-500"}
              />
              {tab.title}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
