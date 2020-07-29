import { useEffect } from "react";
import { createPortal } from "react-dom";

const Portal = ({ children }) => {
  let mount = document.getElementById("portal-root");
  const el = document.createElement("div");

  useEffect(() => {
    if (!mount) {
      mount = document.createElement("div");
      mount.setAttribute("id", "portal-root");
      document.body.appendChild(mount);
    }
    mount.appendChild(el);

    return () => mount.removeChild(el);
  }, [mount]);

  return createPortal(children, el);
};

export default Portal;
