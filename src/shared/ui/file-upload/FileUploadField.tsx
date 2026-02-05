import { type ReactNode } from "react";
import { useDropzone, type Accept } from "react-dropzone";

import { IconDelete } from "../icons";

type SelectedFile = {
  name: string;
  size: number;
};

type FileUploadFieldProps = {
  title: string;
  accept: Accept;
  formatsHint: string;
  selectedFile: SelectedFile | null;
  isDisabledSelect?: boolean;
  emptyStateText?: string;
  icon: ReactNode;
  onFileSelected: (file: File) => Promise<void>;
  onDelete: () => void;
  error?: string;
  onError?: (message: string) => void;
  showPreviewImage?: boolean;
  previewSrc?: string | null;
  footer?: ReactNode;
};

const formatFileSize = (bytes: number) => {
  if (!bytes) return "";

  if (bytes < 1024) return `${bytes} Б`;

  const kiloBytes = Math.ceil(bytes / 1024);
  if (kiloBytes < 1024) return `${kiloBytes} КБ`;

  const megaBytes = bytes / (1024 * 1024);
  return `${megaBytes.toFixed(1)} МБ`.replace(".", ",");
};

export const FileUploadField = ({
  title,
  accept,
  formatsHint,
  selectedFile,
  isDisabledSelect = false,
  emptyStateText = "Перетащите файлы или ",
  icon,
  onFileSelected,
  onDelete,
  error,
  onError,
  showPreviewImage = false,
  previewSrc = null,
  footer,
}: FileUploadFieldProps) => {
  const isFileSelected = Boolean(selectedFile);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    multiple: false,
    noClick: isDisabledSelect || isFileSelected,
    noKeyboard: isDisabledSelect || isFileSelected,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      onFileSelected(file).catch((uploadError) => {
        onError?.((uploadError as Error).message);
      });
    },
  });

  const shouldShowPreview = Boolean(showPreviewImage && previewSrc);

  return (
    <div>
      {!!title && (
        <div className="text-[16px] font-semibold text-gray-900">{title}</div>
      )}

      <div
        {...getRootProps()}
        className={[
          "w-full max-w-[440px] rounded-[10px] px-[8px] items-start mt-[20px]",
          isFileSelected ? "h-[40px]" : "h-[116px]",
          isDisabledSelect
            ? "cursor-not-allowed opacity-60"
            : isFileSelected
              ? "cursor-default"
              : "cursor-pointer",
          isFileSelected ? "bg-white" : "border border-dashed border-brand-500",
          isDragActive && !isFileSelected ? "bg-brand-50" : "bg-white",
          isFileSelected
            ? "flex items-center"
            : "flex flex-col items-center justify-center text-center",
        ].join(" ")}
      >
        <input {...getInputProps()} />

        {!isFileSelected && (
          <>
            <div className="text-[14px] font-normal text-gray-800">
              {emptyStateText}
              <span className="text-brand-500">загрузите</span>
            </div>

            <div className="mt-1 text-[12px] font-normal text-brand-400">
              Поддерживаемые форматы: {formatsHint}
            </div>
          </>
        )}

        {isFileSelected && selectedFile && (
          <div className="flex w-full items-center justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-brand-200 text-[12px] font-normal text-brand-500 overflow-hidden">
                {shouldShowPreview ? (
                  <img
                    src={previewSrc!}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  icon
                )}
              </div>

              <div className="min-w-0">
                <div className="truncate text-[14px] font-normal text-[#002033]">
                  {selectedFile.name}
                </div>

                <div className="text-[14px] font-normal text-[#002033] opacity-[30%]">
                  {formatFileSize(selectedFile.size)}
                </div>
              </div>
            </div>

            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onDelete();
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[10px]"
              aria-label="Удалить файл"
              disabled={isDisabledSelect}
            >
              <IconDelete className="text-red-500" />
            </button>
          </div>
        )}
      </div>

      {isFileSelected && footer && <div className="mt-4">{footer}</div>}

      {!isFileSelected && error && (
        <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};
