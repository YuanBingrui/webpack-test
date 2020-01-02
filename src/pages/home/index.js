import React from "react";
import ReactDom from 'react-dom';

import Layout from '../../layout';

export default function App() {
  return (
    <Layout>
      <div className="App">
        <h1>Hello Webpack</h1>
        <h2>Let us to study webpack together!!!</h2>
        <div>fasdfdsfgggggffdsf</div>
      </div>
    </Layout>
  );
}

ReactDom.render(<App />, document.getElementById("root"));
