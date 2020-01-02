import React from 'react';
import ReactDom from 'react-dom';

import Layout from '../../layout';

import styles from './style.css';

export default function Page2() {
  return (
    <Layout>
      <div className={styles.page2}>
        This is a Page two
      </div>
    </Layout>
  )
}

ReactDom.render(<Page2 />, document.getElementById("root"));
