import React from 'react';

import styles from './style.module.less';

export default function HelloWorld() {
  return (
    <div className={styles.helloWord}>
      Hello World!!!
      <div className="desc">
        It is me!!
      </div>
    </div>
  )
}
