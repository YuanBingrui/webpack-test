import React from 'react';
import loadable from '@loadable/component';

const Moment = loadable.lib(() => import('moment'));

export default function index() {
  return (
    <div style={{ height: 2000 }}>
      This is page2
      <br/>
      <div>
        <Moment>
          {({ default: moment }) => moment().fromNow()}
        </Moment>
      </div>
    </div>
  )
}
