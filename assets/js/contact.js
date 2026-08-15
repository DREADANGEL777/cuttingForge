import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { firebaseConfig, cloudinaryConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MAX_FILES = 5;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const ALLOWED_EXTENSIONS = [
  "jpg", "jpeg", "png",
  "glb", "gltf",
  "3mf", "amf",
  "stl", "obj",
  "step", "stp",
  "iges", "igs",
  "dxf", "svg",
  "pdf",
];

function getExtension(fileName) {
  return fileName.split(".").pop().toLowerCase();
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function t() {
  return window.__t || window.translations.ua;
}

function validateFile(file) {
  const extension = getExtension(file.name);
  const errors = t().contact.errors;

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return { valid: false, message: `${file.name}: ${errors.invalidFormat}` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, message: `${file.name}: ${errors.fileTooLarge}` };
  }
  return { valid: true };
}

function validateFiles(selectedFiles, currentFiles) {
  const errors = [];
  const validFiles = [];
  const messages = t().contact.errors;

  if (selectedFiles.length + currentFiles.length > MAX_FILES) {
    errors.push(messages.tooManyFiles);
    return { validFiles, errors };
  }

  for (const file of selectedFiles) {
    const validation = validateFile(file);
    if (!validation.valid) {
      errors.push(validation.message);
      continue;
    }

    const duplicate = currentFiles.find((f) => f.name === file.name && f.size === file.size);
    if (duplicate) {
      errors.push(`${file.name}: ${messages.duplicateFile}`);
      continue;
    }

    validFiles.push(file);
  }

  return { validFiles, errors };
}

function validateForm({ name, contact, message }) {
  const errors = {};
  const messages = t().contact.errors;

  if (!name.trim()) errors.name = messages.requiredName;

  if (!contact.trim()) {
    errors.contact = messages.requiredContact;
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+]?[\d\s()-]{8,20}$/;
    if (!emailRegex.test(contact) && !phoneRegex.test(contact)) {
      errors.contact = messages.invalidContact;
    }
  }

  if (!message.trim() || message.trim().length < 10) {
    errors.message = messages.requiredMessage;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function uploadFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryConfig.uploadPreset);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`;

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded * 100) / event.total));
    };

    xhr.onload = () => {
      if (xhr.status !== 200) {
        reject(new Error("Cloudinary upload failed"));
        return;
      }
      const data = JSON.parse(xhr.responseText);
      resolve({
        name: file.name,
        size: file.size,
        type: file.type,
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        bytes: data.bytes,
      });
    };

    xhr.onerror = () => reject(new Error("Upload error"));
    xhr.open("POST", uploadUrl);
    xhr.send(formData);
  });
}

async function uploadFiles(files, onProgress) {
  const uploaded = [];
  for (let i = 0; i < files.length; i++) {
    const result = await uploadFile(files[i], (progress) => onProgress(files[i].name, progress));
    uploaded.push(result);
  }
  return uploaded;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  const nameInput = form.querySelector('[name="name"]');
  const contactInput = form.querySelector('[name="contact"]');
  const messageInput = form.querySelector('[name="message"]');
  const fileInput = form.querySelector("#file-upload");
  const uploadBox = form.querySelector(".upload-box");
  const fileErrorsBox = form.querySelector(".file-errors");
  const filesWrapper = form.querySelector(".files-wrapper");
  const filesList = form.querySelector(".files-list");
  const submitBtn = form.querySelector('button[type="submit"]');

  let files = [];
  const progressMap = {};

  function renderFileErrors(errors) {
    fileErrorsBox.innerHTML = "";
    errors.forEach((message) => {
      const p = document.createElement("p");
      p.textContent = message;
      fileErrorsBox.appendChild(p);
    });
  }

  function renderFiles() {
    filesList.innerHTML = "";
    filesWrapper.style.display = files.length ? "flex" : "none";

    files.forEach((file) => {
      const row = document.createElement("div");
      row.className = "file-item";

      const info = document.createElement("div");
      info.className = "file-info";
      info.innerHTML = `<span>📄 ${file.name}</span><small>${formatFileSize(file.size)}</small>`;
      row.appendChild(info);

      if (progressMap[file.name] !== undefined) {
        const progressContainer = document.createElement("div");
        progressContainer.className = "progress-container";
        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar";
        progressBar.style.width = `${progressMap[file.name]}%`;
        progressContainer.appendChild(progressBar);
        row.appendChild(progressContainer);
      }

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "remove-file";
      removeBtn.textContent = "✕";
      removeBtn.addEventListener("click", () => {
        files = files.filter((f) => f.name !== file.name);
        delete progressMap[file.name];
        renderFiles();
      });
      row.appendChild(removeBtn);

      filesList.appendChild(row);
    });
  }

  function addFiles(selectedFiles) {
    const result = validateFiles(selectedFiles, files);
    renderFileErrors(result.errors);
    files = files.concat(result.validFiles);
    renderFiles();
  }

  fileInput.addEventListener("change", (e) => {
    addFiles(Array.from(e.target.files));
    fileInput.value = "";
  });

  uploadBox.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadBox.classList.add("active");
  });

  uploadBox.addEventListener("dragleave", () => uploadBox.classList.remove("active"));

  uploadBox.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadBox.classList.remove("active");
    addFiles(Array.from(e.dataTransfer.files));
  });

  function setFieldError(input, message) {
    const next = input.nextElementSibling;
    const errorEl = next && next.classList.contains("error") ? next : null;
    if (message) {
      if (errorEl) {
        errorEl.textContent = message;
      } else {
        const span = document.createElement("span");
        span.className = "error";
        span.textContent = message;
        input.insertAdjacentElement("afterend", span);
      }
    } else if (errorEl) {
      errorEl.remove();
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value;
    const contact = contactInput.value;
    const message = messageInput.value;

    const validation = validateForm({ name, contact, message });

    setFieldError(nameInput, validation.errors.name);
    setFieldError(contactInput, validation.errors.contact);
    setFieldError(messageInput, validation.errors.message);

    if (!validation.valid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = t().contact.sending;

    try {
      const uploadedFiles = await uploadFiles(files, (name, progress) => {
        progressMap[name] = progress;
        renderFiles();
      });

      await addDoc(collection(db, "orders"), {
        name,
        contact,
        message,
        files: uploadedFiles,
        status: "new",
        createdAt: serverTimestamp(),
      });

      form.reset();
      files = [];
      Object.keys(progressMap).forEach((key) => delete progressMap[key]);
      renderFiles();
      renderFileErrors([]);
      alert(t().contact.success);
    } catch (error) {
      console.error(error);
      alert(t().contact.error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = t().contact.send;
    }
  });
});
