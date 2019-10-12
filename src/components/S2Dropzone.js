import React, { useCallback, useEffect } from "react";

import { useDropzone } from "react-dropzone";
import mime from "mime/lite";

import { useS2Uploader } from "../utils/S2Uploader";

function S2Dropzone() {
  const { upload } = useS2Uploader();
  const onDrop = useCallback(([file = null] = []) => {
    const { name, type } = file;
    upload(file, name, type);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  useEffect(() => {
    const pasteCallback = async e => {
      const cdItem = e.clipboardData.items[0];
      if (!cdItem) return;
      let data = null,
        ext = "";
      switch (cdItem.kind) {
        case "string":
          data = new Blob([await new Promise(r => cdItem.getAsString(r))], {
            type: "text/plain"
          });
          ext = "txt";
          break;
        case "file":
          data = cdItem.getAsFile();
          ext = mime.getExtension(data.type);
          break;
        default:
          return;
      }
      const type = cdItem.kind;
      const fileName = `clipboard_${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.${ext}`;
      upload(data, fileName, type);
    };
    window.addEventListener("paste", pasteCallback);
    return () => window.removeEventListener("paste", pasteCallback);
  }, []);

  return (
    <div
      {...getRootProps()}
      className={`dropzone${isDragActive ? " dropzone--active" : ""}`}
    >
      <input {...getInputProps()} />
      <div>
        <i className="material-icons logo-icon">cloud_upload</i>
        <h1>s2.m98.be</h1>
        <p>ephemeral file sharing service</p>
        <p>drop / select / paste file to upload.</p>
      </div>
    </div>
  );
}
export default S2Dropzone;
