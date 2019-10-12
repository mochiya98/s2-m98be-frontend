import "./index.css";

import ReactDOM from "react-dom";
import React, {
  useCallback,
  useContext,
  useRef,
  useState,
  createContext,
  useEffect
} from "react";

import {
  S2Uploader,
  S2UploaderProvider,
  useS2Uploader
} from "./utils/S2Uploader";
import UploadProgressView from "./components/UploadProgressView";
import S2Dropzone from "./components/S2Dropzone";

function AppView() {
  const {
    mode,
    progress,
    bytesTransferred,
    totalBytes,
    url,
    fileName,
    prettierBytes
  } = useS2Uploader();

  useEffect(() => {
    if (!url) return;
    document.title = `${url.replace(/^[a-zA-Z]+:\/\//, "")} - s2.m98.be`;
    const onBeforeUnload = function(e) {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [url]);

  const preventDefaultCallback = useCallback(e => {
    e.preventDefault();
  }, []);

  if (mode === S2Uploader.MODE_IDLE) {
    return <S2Dropzone />;
  }

  let title = "",
    desc = "",
    icon = "",
    active = true,
    hide = false;
  switch (mode) {
    case S2Uploader.MODE_WAITING_FIREBASE:
      title = "ライブラリを読み込んでいます...";
      desc = "firebase tools";
      icon = "get_app";
      break;
    case S2Uploader.MODE_WAITING_TOKEN:
      title = "トークンを準備しています...";
      desc = "firebase security token";
      icon = "vpn_key";
      break;
    case S2Uploader.MODE_UPLOADING:
      title = `アップロード中です(${(progress * 100).toFixed(1)}%)...`;
      desc = `${prettierBytes(bytesTransferred)}/${prettierBytes(totalBytes)}`;
      icon = "cloud_upload";
      active = false;
      break;
    case S2Uploader.MODE_WAITING_S:
      title = "短縮URLを生成しています...";
      desc = "s.m98.be";
      icon = "cloud_upload";
      break;
    case S2Uploader.MODE_COMPLETED:
      title = "アップロード完了。";
      desc = `${fileName} - ${prettierBytes(totalBytes)}`;
      icon = "done";
      active = false;
      hide = true;
      break;
  }

  return (
    <div className="upload-layout-box">
      <div className="upload-info-box">
        <UploadProgressView
          title={title}
          desc={desc}
          icon={icon}
          active={active}
          progress={progress}
          hide={hide}
        />
        <div
          className={`upload-result-box${
            hide ? " upload-result-box--visible" : ""
          }`}
        >
          <p>
            <a
              className="url"
              href={url}
              target="_blank"
              onClick={preventDefaultCallback}
            >
              {url.replace(/^[a-zA-Z]+:\/\//, "")}
            </a>
          </p>
          <p className="desc">active until window closed</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <S2UploaderProvider>
      <AppView />
    </S2UploaderProvider>
  );
}

const appElem = document.body.appendChild(document.createElement("div"));
appElem.className = "app";
ReactDOM.render(<App />, appElem);
