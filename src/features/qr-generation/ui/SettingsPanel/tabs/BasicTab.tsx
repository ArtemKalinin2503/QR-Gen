import isUrl from "is-url-http";
import type { GeneratorType } from "../../../model/types";
import { IconFileCsv } from "../../../../../shared/ui/icons";
import { useQrGeneratorStore } from "../../../../../store/qrGenerator.store";
import { QrGeneratorSettingsFormStoreSync } from "../../Forms/QrGeneratorSettingsFormStoreSync";
import { FileUploadField } from "../../../../../shared/ui/file-upload/FileUploadField";
import { validateRegistryRows } from "../../../lib/validateRegistryRows";
import { RegistryValidationModal } from "../../Modals/RegistryValidationModal";

const COLUMN_COUNT = 2;

type RegistryRow = [fileName: string, data: string];

type BasicTabProps = {
  generatorType: GeneratorType;
};

export const BasicTab = ({ generatorType }: BasicTabProps) => {
  const isRegistryGenerator = generatorType === "registry";

  return (
    <div className="pt-[30px]">
      {isRegistryGenerator && <RegistrySection />}

      <div className={isRegistryGenerator ? "mt-6" : undefined}>
        <QrGeneratorSettingsFormStoreSync generatorType={generatorType} />
      </div>
    </div>
  );
};

const downloadRegistryValidationReport = (
  errors: ReturnType<typeof validateRegistryRows>,
) => {
  const header = "lineNumber\tfileName\tmessage\n";
  const body = errors
    .map((e) => {
      const fileName = (e.fileName || "").replace(/\t/g, " ");
      const message = (e.message || "").replace(/\t/g, " ");
      return `${e.lineNumber}\t${fileName}\t${message}`;
    })
    .join("\n");

  const blob = new Blob([header + body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "registry_validation_report.tsv";
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
};

const RegistrySection = () => {
  const registry = useQrGeneratorStore((state) => state.registry);

  const setRegistryData = useQrGeneratorStore((state) => state.setRegistryData);
  const setRegistryError = useQrGeneratorStore((state) => state.setRegistryError);
  const resetRegistry = useQrGeneratorStore((state) => state.resetRegistry);

  const openModal = useQrGeneratorStore((s) => s.openRegistryValidationModal);
  const closeModal = useQrGeneratorStore((s) => s.closeRegistryValidationModal);

  const onFileSelected = async (file: File) => {
    try {
      const parsedRows = await parseRegistry(file);

      setRegistryData({
        fileName: file.name,
        fileSize: file.size,
        rows: parsedRows,
      });

      const validationErrors = validateRegistryRows(parsedRows);
      if (validationErrors.length > 0) {
        openModal(validationErrors);
      }
    } catch (e) {
      setRegistryError((e as Error)?.message || "Ошибка чтения реестра");
    }
  };

  const selectedFile = registry.fileName
    ? { name: registry.fileName, size: registry.fileSize }
    : null;

  const hasValidationErrors = registry.validationErrors.length > 0;

  const registryErrorText =
    registry.error || (hasValidationErrors ? "Реестр содержит ошибки" : "");

  return (
    <>
      <FileUploadField
        title="Реестр"
        accept={{ "text/csv": [".csv"] }}
        formatsHint="CSV"
        selectedFile={selectedFile}
        icon={<IconFileCsv size={40} />}
        onFileSelected={onFileSelected}
        onDelete={resetRegistry}
        error={registryErrorText}
        onError={setRegistryError}
        footer={
          <div className="grid gap-3">
            {registryErrorText && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {registryErrorText}
              </div>
            )}

            {registry.rows.length > 0 && (
              <div className="text-[14px] font-normal text-[#002033] opacity-[60%]">
                Строк в реестре: {registry.rows.length}
              </div>
            )}
          </div>
        }
      />

      <RegistryValidationModal
        open={registry.isValidationModalOpen}
        errors={registry.validationErrors}
        onClose={closeModal}
        onDownloadReport={() =>
          downloadRegistryValidationReport(registry.validationErrors)
        }
      />
    </>
  );
};

const MAX_ROWS = 150_000;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const splitCsvLineBySemicolon = (line: string) => {
  const result: string[] = [];
  let current = "";
  let isInQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const next = line[i + 1];

      if (isInQuotes && next === '"') {
        current += '"';
        i += 1;
        continue;
      }

      isInQuotes = !isInQuotes;
      continue;
    }

    if (char === ";" && !isInQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
};

const parseRegistry = async (registry: File): Promise<RegistryRow[]> => {
  if (registry.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Файл реестра не должен превышать 10 МБ");
  }

  const body = (await registry.text()).replace(/^\uFEFF/, "");
  const lines = body
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) {
    throw new Error("В реестре нет строк");
  }

  if (lines.length > MAX_ROWS) {
    throw new Error("В реестре не должно быть больше 150 000 строк");
  }

  const rows: RegistryRow[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const row = lines[index];
    const columns = splitCsvLineBySemicolon(row);

    if (columns.length !== COLUMN_COUNT) {
      throw new Error(
        `В ${index + 1} строке реестра должны быть ${COLUMN_COUNT} колонки`,
      );
    }

    const fileName = (columns[0] ?? "").trim();
    const data = (columns[1] ?? "").trim();

    let normalizedData = data;
    if (data && isUrl(data)) {
      const url = new URL(data);
      normalizedData = url.toString();
    }

    rows.push([fileName, normalizedData]);
  }

  return rows;
};
