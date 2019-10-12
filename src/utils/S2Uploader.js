import React, { useContext, useEffect, useState, createContext } from "react";
import { API_BASE_URL } from "../constants";

function callSAPI(params) {
  let k,
    formData = new FormData();
  for (k in params) formData.append(k, params[k]);
  return fetch("https://s.m98.be/s", { method: "POST", body: formData });
}

const firebaseToolsLoader = import(
  /* webpackChunkName: "firebase-tools" */ "./firebase-tools"
);

if (~~(Math.random() * 10) === 7) fetch(`${API_BASE_URL}/runCleanJob`);

const tokenLoader = fetch(`${API_BASE_URL}/generateUploadToken`)
  .then(r => r.json());
/*
let tokenLoader = {
  result: {
    token:
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTU3MDcyMDAxNCwiZXhwIjoxNTcwNzIzNjE0LCJpc3MiOiJzMi1tOThiZUBhcHBzcG90LmdzZXJ2aWNlYWNjb3VudC5jb20iLCJzdWIiOiJzMi1tOThiZUBhcHBzcG90LmdzZXJ2aWNlYWNjb3VudC5jb20iLCJ1aWQiOiJhbm9ueW1vdXMiLCJjbGFpbXMiOnsiZmlsZUlEIjoiMjM0ZWQ5OGY0N2NkNGQyZTYxOWRjNzIzMWE2Yjc3MmQifX0.V0THuNVMPgfFIrE5vDEuitDgRXe6eHkK_qu2WRsAEFb0DQkg9zCmwB_ZA6c3n_CttPQF_prSa9iUQNaPXfTfIckSAleLaHms3kvrG-0lo64R7K9DcMb7NhZeAnvQifzE45TBkevMUHHP5Kf-gnxDDSRUxFFh2BxqdUCRWPt1P8sljrpM89zbK-5eJHTrVP8rPC4FrebhypcnJrf2aDxARDXDBVEilNVfZEYUlkrOxiEfWlDN_C7mpIerc_GWoCNmdY7qahVfg5Av5fvXVV1BASQpMdsssMKz7S6dPA06PHf_dn16TndXCV2JNoq4dnTLn0lP0cnwJzh60P3YwVAERw"
  },
  err: null
};
*/

const tokenAuthLoader = Promise.all([firebaseToolsLoader, tokenLoader]).then(
  async () => {
    const { firebase, prettierBytes } = await firebaseToolsLoader;
    const token = await getToken();
    const tokenData = JSON.parse(atob(token.split(".")[1]));
    await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
    await firebase.auth().signInWithCustomToken(token);
    return tokenData.claims;
  }
);

async function getToken() {
  const { result, err } = await tokenLoader;
  if (err) {
    //console.error(err);
    throw new Error(err.toString());
  }
  const { token } = result;
  return token;
}

export class S2Uploader {
  static MODE_IDLE = 0;
  static MODE_WAITING_FIREBASE = 1;
  static MODE_WAITING_TOKEN = 2;
  static MODE_UPLOADING = 3;
  static MODE_WAITING_S = 4;
  static MODE_COMPLETED = 5;
  constructor() {
    this.upload = this.upload.bind(this);
    this.state = {
      mode: S2Uploader.MODE_IDLE,
      upload: this.upload,
      progress: 1,
      bytesTransferred: 0,
      totalBytes: 0,
      data: null,
      mimeType: null,
      prettierBytes: null,
      fileName: "",
      url: ""
    };
  }
  setOnUpdateState(onUpdateState) {
    this.onUpdateState = onUpdateState;
  }
  async upload(data, fileName, mimeType = null) {
    if (this.state.mode !== S2Uploader.MODE_IDLE) return;
    this.onUpdateState(
      (this.state = {
        ...this.state,
        mode: S2Uploader.MODE_WAITING_FIREBASE,
        data,
        fileName,
        mimeType
      })
    );
    const { firebase, prettierBytes } = await firebaseToolsLoader;
    this.onUpdateState(
      (this.state = {
        ...this.state,
        mode: S2Uploader.MODE_WAITING_TOKEN,
        prettierBytes
      })
    );
    await getToken();
    const { fileID } = await tokenAuthLoader;
    const storageRef = firebase.storage().ref();
    const uploadTask = storageRef.child(fileID).put(data, {
      contentDisposition: `attachment; filename="${fileName}"; filename*=utf-8''${encodeURIComponent(
        fileName
      )}`,
      contentType: mimeType
    });
    await new Promise((uploaded, onErr) => {
      uploadTask.on(
        "state_changed",
        snapshot => {
          //console.log(snapshot.bytesTransferred , snapshot.totalBytes);
          const progress = snapshot.bytesTransferred / snapshot.totalBytes;
          this.onUpdateState(
            (this.state = {
              ...this.state,
              mode: S2Uploader.MODE_UPLOADING,
              progress,
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes
            })
          );
        },
        onErr,
        uploaded
      );
    });
    this.onUpdateState(
      (this.state = {
        ...this.state,
        mode: S2Uploader.MODE_WAITING_S,
        progress: 1
      })
    );
    const dlURL = `${API_BASE_URL}/downloadFile?file_id=${fileID}`;
    const { id, hash } = await callSAPI({ q: dlURL }).then(r => r.json());
    const idText = ("00" + id).slice(-3);
    const sURL = `https://m98.be/${idText}`;
    this.onUpdateState(
      (this.state = {
        ...this.state,
        mode: S2Uploader.MODE_COMPLETED,
        url: sURL
      })
    );
    setInterval(() => {
      callSAPI({ id, hash });
      fetch(`${API_BASE_URL}/extendExpirationTime?file_id=${fileID}`);
    }, 1000 * 60);
    await firebase.auth().signOut();
  }
}
const s2UploaderContext = createContext(null);
export function S2UploaderProvider({ children }) {
  const [s2Uploader] = useState(() => new S2Uploader());
  const [state, setState] = useState(() => s2Uploader.state);
  useEffect(() => {
    s2Uploader.setOnUpdateState(setState);
  }, []);
  return (
    <s2UploaderContext.Provider value={state}>
      {children}
    </s2UploaderContext.Provider>
  );
}
export function useS2Uploader() {
  return useContext(s2UploaderContext);
}
