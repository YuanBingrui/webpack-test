import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import loadable from '@loadable/component';

import ScrollToTop from '@/components/ScrollToTop';

const Page1 = loadable(() => import('./pages/page1'));
const Page2 = loadable(() => import('./pages/page2'));
const Topics = loadable(() => import('./pages/topics'));

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <nav>
            <ul>
              <li>
                <Link to="/page1">Page1</Link>
              </li>
              <li>
                <Link to="/page2">Page2</Link>
              </li>
              <li>
                <Link to="/topics">Topics</Link>
              </li>
            </ul>
          </nav>
          <Switch>
            <Route path="/page1">
              <Page1 />
            </Route>
            <Route path="/page2">
              <Page2 />
            </Route>
            <Route path="/topics">
              <Topics />
            </Route>
          </Switch>
        </Suspense>
      </div>
    </Router>
  );
}
