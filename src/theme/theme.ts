import { createTheme } from "@mui/material/styles";

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: "#634BDE",
    },
    secondary: {
      main: "#9283C0",
    },
    background: {
      default: "#F6FAFF",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#000000",
    },
  },
  typography: {
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 700,
    subtitle2: {
      fontSize: "14px",
      fontWeight: 600,
    },
    caption: {
      fontSize: "13px",
    },
    body1: {
      fontSize: "16px",
    },
    body2: {
      fontSize: "14px",
    },
    button: {
      fontSize: "14px",
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 8,
  },
});
