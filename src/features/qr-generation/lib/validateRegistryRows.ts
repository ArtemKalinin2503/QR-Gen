export type RegistryValidationError = {
  lineNumber: number;
  fileName: string;
  message: string;
};

type RegistryRow = [fileName: string, data: string];

export const validateRegistryRows = (rows: RegistryRow[]): RegistryValidationError[] => {
  const errors: RegistryValidationError[] = [];

  const seen = new Map<string, number>();

  rows.forEach(([fileNameRaw, dataRaw], idx) => {
    const lineNumber = idx + 1;
    const fileName = String(fileNameRaw ?? "").trim();
    const data = String(dataRaw ?? "").trim();

    if (!fileName) {
      errors.push({ lineNumber, fileName: "", message: "Пустое имя файла" });
    }

    if (!data) {
      errors.push({ lineNumber, fileName, message: "Пустые данные для QR" });
    }

    if (fileName) {
      const prev = seen.get(fileName);
      if (typeof prev === "number") {
        errors.push({
          lineNumber,
          fileName,
          message: `Дубликат имени файла (повтор строки ${prev})`,
        });
      } else {
        seen.set(fileName, lineNumber);
      }
    }
  });

  return errors;
};
