import React from "react";

import styles from "./Modal.module.css";

const Modal = ({ show, setShow, children }) => {
  return (
    <div
      className={styles.container}
      style={{ display: show ? "flex" : "none" }}
    >
      <div className={styles.overlay} onClick={() => setShow(false)}></div>
      <div className={styles.modal}>
        <div className={styles.cross} onClick={() => setShow(false)}>
          &#10005;
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
