import type { RegistryValidationError } from "./validateRegistryRows";

export const downloadRegistryValidationReport = (errors: RegistryValidationError[]) => {
  const header = "lineNumber\tfileName\tmessage\n";
  const body = errors
    .map((e) => `${e.lineNumber}\t${(e.fileName || "").replace(/\t/g, " ")}\t${e.message.replace(/\t/g, " ")}`)
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
