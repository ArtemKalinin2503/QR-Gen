import { create } from "zustand";
import type { Options } from "qr-code-styling";
import type { RegistryValidationError } from "../features/qr-generation/lib/validateRegistryRows";

type RegistryRow = [fileName: string, data: string];

type RegistryState = {
  fileName: string;
  fileSize: number;
  rowsCount: number;
  rows: RegistryRow[];
  error: string;
  validationErrors: RegistryValidationError[];
  isValidationModalOpen: boolean;
};

type UploadFileState = {
  fileName: string;
  fileSize: number;
  dataUrl: string | null;
  error: string;
};

type DotType = NonNullable<NonNullable<Options["dotsOptions"]>["type"]>;
type CornerSquareType =
  NonNullable<NonNullable<Options["cornersSquareOptions"]>["type"]>;
type CornerDotType =
  NonNullable<NonNullable<Options["cornersDotOptions"]>["type"]>;

type StyleMode = "auto" | "manual";

type QrSettingsState = {
  sizePx: number;
  hasSafeZone: boolean;
  safeZoneColor: string;
  safeZoneSizePx: number;

  lineThickness: number;
  verticalAlignmentScale: number;
  horizontalAlignmentScale: number;

  dotsTypeMode: StyleMode;
  dotsType: DotType;
  dotsColor: string;

  cornersSquareTypeMode: StyleMode;
  cornersSquareType: CornerSquareType;
  cornersSquareColor: string;

  cornersDotTypeMode: StyleMode;
  cornersDotType: CornerDotType;
  cornersDotColor: string;

  logoBackgroundEnabled: boolean;
  logoBackgroundColor: string;
  logoSizePx: number;
  backgroundColor: string;
  backgroundAutoPickEnabled: boolean;

  signatureEnabled: boolean;
  signatureText: string;
  signatureBorderColor: string;

  dynamicFields: Record<string, string | number | boolean>;
};

type QrGeneratorState = {
  registry: RegistryState;

  logo: UploadFileState;
  background: UploadFileState;

  qrSettings: QrSettingsState;
  qrSettingsResetVersion: number;

  setQrSettings: (payload: Partial<QrSettingsState>) => void;
  resetQrSettings: () => void;

  setRegistryData: (payload: {
    fileName: string;
    fileSize: number;
    rows: RegistryRow[];
  }) => void;
  setRegistryError: (message: string) => void;
  resetRegistry: () => void;

  openRegistryValidationModal: (errors: RegistryValidationError[]) => void;
  closeRegistryValidationModal: () => void;
  clearRegistryValidation: () => void;

  setLogoFile: (payload: {
    fileName: string;
    fileSize: number;
    dataUrl: string;
  }) => void;
  setLogoError: (message: string) => void;
  resetLogo: () => void;

  setBackgroundFile: (payload: {
    fileName: string;
    fileSize: number;
    dataUrl: string;
  }) => void;
  setBackgroundError: (message: string) => void;
  resetBackground: () => void;
};

const initialRegistryState: RegistryState = {
  fileName: "",
  fileSize: 0,
  rowsCount: 0,
  rows: [],
  error: "",
  validationErrors: [],
  isValidationModalOpen: false,
};

const initialUploadFileState: UploadFileState = {
  fileName: "",
  fileSize: 0,
  dataUrl: null,
  error: "",
};

const getInitialQrSettingsState = (): QrSettingsState => ({
  sizePx: 1000,
  hasSafeZone: false,
  safeZoneColor: "#FFFFFF",
  safeZoneSizePx: 16,

  lineThickness: 0.5,
  verticalAlignmentScale: 0.5,
  horizontalAlignmentScale: 0.5,

  dotsTypeMode: "auto",
  dotsType: "rounded",
  dotsColor: "#000000",

  cornersSquareTypeMode: "auto",
  cornersSquareType: "square",
  cornersSquareColor: "#000000",

  cornersDotTypeMode: "auto",
  cornersDotType: "dot",
  cornersDotColor: "#000000",

  logoBackgroundEnabled: true,
  logoBackgroundColor: "#FFFFFF",
  logoSizePx: 100,

  backgroundColor: "",
  backgroundAutoPickEnabled: false,

  signatureEnabled: false,
  signatureText: "Отсканируй",
  signatureBorderColor: "#000000",

  dynamicFields: {},
});

export const useQrGeneratorStore = create<QrGeneratorState>((set) => ({
  registry: initialRegistryState,

  logo: initialUploadFileState,
  background: initialUploadFileState,

  qrSettings: getInitialQrSettingsState(),
  qrSettingsResetVersion: 0,

  setQrSettings: (payload) =>
    set((state) => {
      const nextQrSettings = {
        ...state.qrSettings,
        ...payload,
        dynamicFields: payload.dynamicFields
          ? {
              ...state.qrSettings.dynamicFields,
              ...payload.dynamicFields,
            }
          : state.qrSettings.dynamicFields,
      };

      return { qrSettings: nextQrSettings };
    }),

  resetQrSettings: () =>
    set((state) => ({
      qrSettings: getInitialQrSettingsState(),
      qrSettingsResetVersion: state.qrSettingsResetVersion + 1,
    })),

  setRegistryData: ({ fileName, fileSize, rows }) =>
    set((state) => ({
      registry: {
        ...state.registry,
        fileName,
        fileSize,
        rowsCount: rows.length,
        rows,
        error: "",
        validationErrors: [],
        isValidationModalOpen: false,
      },
    })),

  setRegistryError: (message) =>
    set((state) => ({
      registry: {
        ...state.registry,
        rows: [],
        rowsCount: 0,
        error: message,
        validationErrors: [],
        isValidationModalOpen: false,
      },
    })),

  resetRegistry: () => set({ registry: initialRegistryState }),

  openRegistryValidationModal: (errors) =>
    set((state) => ({
      registry: {
        ...state.registry,
        validationErrors: errors,
        isValidationModalOpen: true,
      },
    })),

  closeRegistryValidationModal: () =>
    set((state) => ({
      registry: {
        ...state.registry,
        isValidationModalOpen: false,
      },
    })),

  clearRegistryValidation: () =>
    set((state) => ({
      registry: {
        ...state.registry,
        validationErrors: [],
        isValidationModalOpen: false,
      },
    })),

  setLogoFile: ({ fileName, fileSize, dataUrl }) =>
    set({
      logo: {
        fileName,
        fileSize,
        dataUrl,
        error: "",
      },
    }),

  setLogoError: (message) =>
    set((state) => ({
      logo: {
        ...state.logo,
        error: message,
      },
    })),

  resetLogo: () => set({ logo: initialUploadFileState }),

  setBackgroundFile: ({ fileName, fileSize, dataUrl }) =>
    set({
      background: {
        fileName,
        fileSize,
        dataUrl,
        error: "",
      },
    }),

  setBackgroundError: (message) =>
    set((state) => ({
      background: {
        ...state.background,
        error: message,
      },
    })),

  resetBackground: () => set({ background: initialUploadFileState }),
}));
