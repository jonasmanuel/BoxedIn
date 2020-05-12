import React from 'react';
import './App.css';
import GMail from './GMail'
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Settings from './Settings';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

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
      <div className="App">
        <header className="App-header">
          <Router>
              <nav>
                <ul>
                  <li>
                    <Link to="/">Home</Link>
                  </li>
                  <li>
                    <Link to="/settings">Settings</Link>
                  </li>
                </ul>
              </nav>
              <Switch>
                <Route path="/settings">
                  <Settings></Settings>
                </Route>
                <Route path="/">
                  <GMail></GMail>
                </Route>
              </Switch>
          </Router>
        </header>
      </div>
    </ThemeProvider>
  );
}

export default App;
