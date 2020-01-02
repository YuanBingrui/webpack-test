import React from 'react';

import Header from './components/Header';
import Footer from './components/Footer';

import './style.css';

export default function Layout(props) {
  return (
    <div className="layout">
      <Header />
      <div className="layout-content">
        {props.children}
      </div>
      <Footer />
    </div>
  )
}
