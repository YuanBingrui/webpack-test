import React, { useEffect } from 'react';
import {
  Switch,
  Route,
  Link,
  NavLink,
  useRouteMatch,
  useParams,
} from "react-router-dom";

import styles from './style.module.less';

const Topic = () => {
  const { topicId } = useParams();
  return <h3>Requested topic ID: {topicId}</h3>;
}

export default () => {
  let match = useRouteMatch();
  let refNode = null;

  useEffect(() => {
    console.log(refNode);
  }, [])

  console.log(match);

  return (
    <div>
      <h2>Topics</h2>

      <ul>
        <li>
          <Link to={`${match.url}/components`}>Components</Link>
        </li>
        <li>
          <Link to={`${match.url}/props-v-state`} innerRef={node => refNode = node}>
            Props v. State
          </Link>
        </li>
        <li>
          <NavLink to={`${match.url}/react`} activeClassName={styles['link-active']}>react</NavLink>
        </li>
        <li>
          <Link to={{
            pathname: `${match.url}/state`,
            search: "?sort=name",
            state: { fromDashboard: true }
          }}>
            link with state
          </Link>
        </li>
      </ul>

      {/* The Topics page has its own <Switch> with more routes
          that build on the /topics URL path. You can think of the
          2nd <Route> here as an "index" page for all topics, or
          the page that is shown when no topic is selected */}
      <Switch>
        <Route path={`${match.path}/:topicId`}>
          <Topic />
        </Route>
        <Route path={match.path}>
          <h3>Please select a topic.</h3>
        </Route>
      </Switch>
    </div>
  );
}
