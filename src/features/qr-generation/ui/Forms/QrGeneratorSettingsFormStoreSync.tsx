import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import type { GeneratorType } from "../../model/types";
import { useQrGeneratorStore } from "../../../../store/qrGenerator.store";
import { QrGeneratorSettingsForm, type QrSettingsFormValues } from "./QrGeneratorSettingsForm";

type QrGeneratorSettingsFormStoreSyncProps = {
  generatorType: GeneratorType;
};

export function QrGeneratorSettingsFormStoreSync({
  generatorType,
}: QrGeneratorSettingsFormStoreSyncProps) {
  const qrSettings = useQrGeneratorStore((state) => state.qrSettings);
  const qrSettingsResetVersion = useQrGeneratorStore(
    (state) => state.qrSettingsResetVersion,
  );
  const setQrSettings = useQrGeneratorStore((state) => state.setQrSettings);

  const isApplyingExternalResetRef = useRef(false);

  const { control, watch, setValue, reset } = useForm<QrSettingsFormValues>({
    defaultValues: qrSettings,
    mode: "onChange",
  });

  useEffect(() => {
    const subscription = watch((nextValues) => {
      if (isApplyingExternalResetRef.current) return;
      setQrSettings(nextValues as QrSettingsFormValues);
    });

    return () => subscription.unsubscribe();
  }, [watch, setQrSettings]);

  useEffect(() => {
    isApplyingExternalResetRef.current = true;
    reset(useQrGeneratorStore.getState().qrSettings);

    // отпускаем замок на следующем тике, чтобы watch не отправил reset обратно в store
    queueMicrotask(() => {
      isApplyingExternalResetRef.current = false;
    });
  }, [qrSettingsResetVersion, reset]);

  return (
    <QrGeneratorSettingsForm
      generatorType={generatorType}
      control={control}
      watch={watch}
      setValue={setValue}
    />
  );
}
