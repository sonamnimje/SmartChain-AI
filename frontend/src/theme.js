import { createTheme } from '@mui/material/styles';

const getTheme = (mode = 'light') => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#1a237e',
            contrastText: '#fff',
          },
          secondary: {
            main: '#00bcd4',
            contrastText: '#fff',
          },
          background: {
            default: '#eaf1fb',
            paper: '#fff',
          },
          text: {
            primary: '#1a1a1a',
            secondary: '#4b5563',
          },
          divider: '#e0e6ef',
        }
      : {
          primary: {
            main: '#90caf9',
            contrastText: '#0d1117',
          },
          secondary: {
            main: '#00bcd4',
            contrastText: '#fff',
          },
          background: {
            default: '#0d1117',
            paper: '#161b22',
          },
          text: {
            primary: '#fff',
            secondary: '#b0b8c1',
          },
          divider: '#22262c',
        }),
    success: { main: '#22c55e' },
    warning: { main: '#facc15' },
    error: { main: '#ef4444' },
    info: { main: '#38bdf8' },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { fontWeight: 400 },
    body2: { fontWeight: 400 },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: mode === 'light' ? '#fff' : '#161b22',
          borderRadius: 18,
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: mode === 'light' ? '#fff' : '#161b22',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: mode === 'light' ? '#fff' : '#161b22',
          color: mode === 'light' ? '#1a237e' : '#fff',
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: mode === 'light' ? '#f4f7fb' : '#161b22',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
        },
        containedPrimary: {
          background: mode === 'light' ? '#1a237e' : '#90caf9',
          color: mode === 'light' ? '#fff' : '#0d1117',
          '&:hover': {
            background: mode === 'light' ? '#23308c' : '#64b5f6',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          background: 'transparent',
          color: mode === 'light' ? '#1a1a1a' : '#fff',
        },
        input: {
          color: mode === 'light' ? '#1a1a1a' : '#fff',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: mode === 'light' ? '#f4f7fb' : '#22262c',
          borderRadius: 8,
        },
        notchedOutline: {
          borderColor: mode === 'light' ? '#e0e6ef' : '#22262c',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: 4,
        },
      },
    },
  },
});

export default getTheme; 