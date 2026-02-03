import type { RegistryValidationError } from "./validateRegistryRows";

const escapeCsv = (value: unknown) => {
  const v = String(value ?? "");
  // CSV - экранируем кавычки
  const needsQuotes = /[;"\n\r]/.test(v);
  const escaped = v.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
};

export const downloadRegistryErrorsReport = (
  errors: RegistryValidationError[],
) => {
  const header = ["lineNumber", "fileName", "message"].join(";");

  const rows = errors.map((e) =>
    [e.lineNumber, e.fileName || "", e.message].map(escapeCsv).join(";"),
  );

  const csv = [header, ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `registry_validation_errors_${new Date()
    .toISOString()
    .slice(0, 19)}.csv`;
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
};
