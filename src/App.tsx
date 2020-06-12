import React from 'react';
import './App.css';
import GMail from './GMail'
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createMuiTheme, ThemeProvider, makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";
import Settings from './Settings';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import clsx from 'clsx';
import { IconButton, ListItem, ListItemIcon, ListItemText, Avatar } from '@material-ui/core';
import MiniDrawer from './components/MiniDrawer';
import MailIcon from '@material-ui/icons/Mail';
import SettingsIcon from '@material-ui/icons/Settings';
import gmailInstance from './gmail/gmailAPI';
import ExitToApp from '@material-ui/icons/ExitToApp';



const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    content: {
      marginTop: "64px",
      height: "calc(100vh - 64px)",
      width: `calc(100vw - ${theme.spacing(7) + 1}px)`,
      marginLeft: theme.spacing(7) + 1,
      // flexGrow: "1",
      backgroundColor: "#111",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      color: "white",
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginRight: 36,
    },
    hide: {
      display: 'none',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
    drawerOpen: {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: 'hidden',
      width: theme.spacing(7) + 1,
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9) + 1,
      },
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      //justifyContent: 'flex-end',
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
    },
    buttons: {
      marginLeft: "auto"
    }
  }),
);

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [isSignedIn, setSignedIn] = React.useState(false);
  const [profileImage, setProfileImage] = React.useState('');
  const [title, setTitle] = React.useState('')
  React.useEffect(() => {
    gmailInstance.onSignInStatusChanged(isSignedIn => {
      setSignedIn(isSignedIn);
      if (isSignedIn) {
        if (isSignedIn) {
          var profile = gmailInstance.getCurrentUserProfile();
          setProfileImage(profile.getImageUrl());
        }
      }
    })
  }, [])
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar className={clsx(classes.toolbar)}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: open,
            })}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            {title}
          </Typography>
          <div className={classes.buttons}>
            {!isSignedIn ?
              '' :
              <div style={{ display: 'inline-flex' }}>
                <Avatar src={profileImage}></Avatar>
                <IconButton onClick={gmailInstance.signOut.bind(gmailInstance)}>
                  <ExitToApp />
                </IconButton>
              </div>
            }
          </div>
        </Toolbar>
      </AppBar>
      <Router>
        <MiniDrawer open={open} handleDrawerClose={handleDrawerClose}>
          <Link className="nostyle" to="/">
            <ListItem>
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText>
                Inbox
            </ListItemText>
            </ListItem>
          </Link>
          <Link className="nostyle" to="/settings">
            <ListItem>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText>
                Settings
            </ListItemText>
            </ListItem>
          </Link>
        </MiniDrawer>
        <div className={clsx(classes.content, {
          [classes.appBarShift]: open,
        }) + " App"}>
          <Switch>
            <Route path="/settings">
              <Settings onActivation={setTitle}></Settings>
            </Route>
            <Route path="/">
              <GMail onActivation={setTitle}></GMail>
            </Route>
          </Switch>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
