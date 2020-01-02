import React from 'react';
import ReactDom from 'react-dom';

import Layout from '../../layout';

import styles from './style.module.css';

export default function Page1() {
  return (
    <Layout>
      <div className={styles.page1}>
        This is a Page one
      </div>
    </Layout>
  )
}

ReactDom.render(<Page1 />, document.getElementById("root"));
