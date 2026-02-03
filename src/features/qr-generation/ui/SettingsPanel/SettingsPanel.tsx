import type { GeneratorType, SettingsTabKey } from "../../model/types";
import { SettingsTabs } from "./SettingsTabs";
import { BackgroundTab } from "./tabs/BackgroundTab";
import { BasicTab } from "./tabs/BasicTab";
import { LogoTab } from "./tabs/LogoTab";
import { SignatureTab } from "./tabs/SignatureTab";
import { StylesTab } from "./tabs/StylesTab";

type SettingsPanelProps = {
  generatorType: GeneratorType;
  activeTab: SettingsTabKey;
  onTabChange: (tab: SettingsTabKey) => void;
};

const SettingsContent = ({
  generatorType,
  activeTab,
}: {
  generatorType: GeneratorType;
  activeTab: SettingsTabKey;
}) => {
  if (activeTab === "basic") {
    return <BasicTab generatorType={generatorType} />;
  }

  if (activeTab === "styles") {
    return <StylesTab />;
  }

  if (activeTab === "logo") {
    return <LogoTab />;
  }

  if (activeTab === "background") {
    return <BackgroundTab />;
  }

  if (activeTab === "signature") {
    return <SignatureTab />;
  }

  return <div className="pt-6 text-sm text-gray-600">Раздел в разработке</div>;
};

export const SettingsPanel = ({
  generatorType,
  activeTab,
  onTabChange,
}: SettingsPanelProps) => (
  <div className="h-full rounded-[10px] bg-white p-5 shadow-card">
    <SettingsTabs activeTab={activeTab} onTabChange={onTabChange} />
    <SettingsContent generatorType={generatorType} activeTab={activeTab} />
  </div>
);
