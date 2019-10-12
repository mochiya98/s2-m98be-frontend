import React from "react";

function UploadProgressView({
  title,
  desc,
  icon,
  active = false,
  progress = 1,
  hide = false
}) {
  return (
    <div
      className={`upload-progress-box${
        hide ? " upload-progress-box--hide" : ""
      }`}
    >
      <div className="upload-progress-desc">
        <i className="material-icons">{icon}</i>
        <p className="upload-progress-desc__title">{title}</p>
        <p className="upload-progress-desc__desc">{desc}</p>
      </div>
      <div className={`progress${active ? " progress--active" : ""}`}>
        <div
          className="progress__bar"
          style={{ width: (progress * 100).toFixed(3) + "%" }}
        ></div>
      </div>
    </div>
  );
}
export default UploadProgressView;
