import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import type { RegistryValidationError } from "../../lib/validateRegistryRows";

type Props = {
  open: boolean;
  errors: RegistryValidationError[];
  onClose: () => void;
  onDownloadReport: () => void;
};

export const RegistryValidationModal = ({
  open,
  errors,
  onClose,
  onDownloadReport,
}: Props) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Ошибки в реестре</DialogTitle>

      <DialogContent dividers>
        <div className="text-sm text-gray-700">
          Найдено ошибок: <b>{errors.length}</b>
        </div>

        <div className="mt-3 max-h-[420px] overflow-auto rounded border border-gray-200">
          {errors.map((e, i) => {
            const key = `${e.lineNumber}-${e.fileName}-${e.message}-${i}`;

            return (
              <div key={key} className="border-b border-gray-100 p-3 text-sm">
                <div>
                  <b>Строка:</b> {e.lineNumber}
                </div>
                <div>
                  <b>Имя файла:</b> {e.fileName ? e.fileName : "—"}
                </div>
                <div>
                  <b>Ошибка:</b> {e.message}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={onDownloadReport} variant="outlined">
          Скачать отчёт
        </Button>
        <Button onClick={onClose} variant="contained">
          Понятно
        </Button>
      </DialogActions>
    </Dialog>
  );
};
