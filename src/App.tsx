import { useState } from "react";
import type {
  GeneratorType,
  SettingsTabKey,
} from "./features/qr-generation/model/types";
import { HeaderNavigation } from "./features/qr-generation/ui/HeaderNavigation";
import { QrPreviewPanel } from "./features/qr-generation/ui/QrPreviewPanel";
import { SettingsPanel } from "./features/qr-generation/ui/SettingsPanel";

function App() {
  const [activeGeneratorType, setActiveGeneratorType] =
    useState<GeneratorType>("registry");
  const [activeSettingsTab, setActiveSettingsTab] =
    useState<SettingsTabKey>("basic");

  const onGeneratorTypeChange = (nextType: GeneratorType) => {
    setActiveGeneratorType(nextType);
    setActiveSettingsTab("basic");
  };

  return (
    <div className="min-h-screen bg-background-body">
      <div className="mx-auto max-w-[1420px] pb-[86px] pt-5">
        <HeaderNavigation
          activeTab={activeGeneratorType}
          onTabChange={onGeneratorTypeChange}
        />

        <main className="mt-5 flex min-h-[calc(100vh-64px-20px-20px-86px)] gap-5">
          <section className="min-w-0 w-full flex-1 max-w-[940px]">
            <SettingsPanel
              generatorType={activeGeneratorType}
              activeTab={activeSettingsTab}
              onTabChange={setActiveSettingsTab}
            />
          </section>

          <aside className="w-[460px]">
            <div className="h-[682px] rounded-[10px]">
              <QrPreviewPanel generatorType={activeGeneratorType} />
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default App;
