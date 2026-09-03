'use strict';
// .. Client-side logic for audio converter

const $ = (id) => document.getElementById(id);

const dropzone = $('dropzone');
const fileInput = $('fileInput');
const previewWrap = $('previewWrap');
const preview = $('preview');
const fileName = $('fileName');
const fileSize = $('fileSize');
const formatsCard = $('formatsCard');
const formatList = $('formatList');
const formatSearch = $('formatSearch');
const saveCard = $('saveCard');
const saveDir = $('saveDir');
const convertBtn = $('convertBtn');
const btnLabel = convertBtn.querySelector('.btn-label');
const spinner = convertBtn.querySelector('.spinner');
const resultCard = $('resultCard');
const resultBox = $('resultBox');
const saveBtn = $('saveBtn');
const saveBtnLabel = $('saveBtnLabel');
const saveStatus = $('saveStatus');
const errorEl = $('error');
const themeToggle = $('themeToggle');

let formats = [];
let selectedFormat = null;
let currentFile = null;
let lastConvertedBlob = null;
let lastConvertedExt = '';
let currentFileExt = '';
let isConverting = false;

const AUDIO_EXTS = [
  'mp3', 'aac', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'wma',
  'ac3', 'eac3', 'dts', 'truehd', 'wv', 'aiff', 'tta', 'amr',
  'oga', 'spx', 'caf', 'voc', 's16le', 's16be', 's32le', 's32be',
  'f32le', 'f64le', 'u8', 'alaw', 'mulaw', 'ape', 'mpc', 'tak',
  'dsf', 'g722', 'g723_1', 'g726', 'g728', 'g729', 'ilbc',
  'aptx', 'aptx_hd', 'sbc', 'lc3', 'codec2'
];

const CONVERSION_MAP = {
  'mp3':  ['wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  'wav':  ['mp3', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  'flac': ['mp3', 'wav', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  'ogg':  ['mp3', 'wav', 'flac', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  'opus': ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  'm4a':  ['mp3', 'wav', 'flac', 'ogg', 'opus', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  'aac':  ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  'wma':  ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  'ac3':  ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  'dts':  ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  'wv':   ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  'aiff': ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  'tta':  ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  'amr':  ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  'oga':  ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  'spx':  ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  'caf':  ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  'voc':  ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  's16le': ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  's16be': ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  's32le': ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32be', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  's32be': ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 'f32le', 'f64le', 'u8', 'alaw', 'mulaw'],
  'f32le': ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f64le', 'u8', 'alaw', 'mulaw'],
  'f64le': ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'u8', 'alaw', 'mulaw'],
  'u8':    ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'alaw', 'mulaw'],
  'alaw':  ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'mulaw'],
  'mulaw': ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wma', 'ac3', 'dts', 'wv', 'aiff', 'tta', 'amr', 'oga', 'spx', 's16le', 's16be', 's32le', 's32be', 'f32le', 'f64le', 'u8', 'alaw']
};

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('theme', theme); } catch (e) {}
}
themeToggle.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  applyTheme(cur);
});

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = false;
}
function clearError() { errorEl.hidden = true; }

function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getFileExt(name) {
  return (name || '').split('.').pop().toLowerCase();
}

function isAudioFile(ext) {
  return AUDIO_EXTS.includes(ext);
}

function getSupportedFormats(inputExt) {
  if (!inputExt || !CONVERSION_MAP[inputExt]) return [];
  return CONVERSION_MAP[inputExt];
}

function resetAll() {
  currentFile = null;
  selectedFormat = null;
  lastConvertedBlob = null;
  lastConvertedExt = '';
  currentFileExt = '';
  previewWrap.hidden = true;
  formatsCard.hidden = true;
  saveCard.hidden = true;
  resultCard.hidden = true;
  convertBtn.hidden = false;
  convertBtn.disabled = true;
  fileInput.value = '';
  preview.src = '';
  renderFormats();
}

fetch('/api/formats')
  .then((r) => r.json())
  .then((data) => {
    formats = (data.formats || []).map((f) => ({ name: f[0], ext: f[1], group: f[2] || 'audio' }));
    renderFormats();
  })
  .catch(() => showError('Failed to load format list'));

function renderFormats(filter) {
  const q = (filter || '').trim().toLowerCase();
  const supported = currentFileExt ? getSupportedFormats(currentFileExt) : [];
  const formatNames = formats.map((f) => f.ext);

  formatList.innerHTML = '';

  if (!currentFileExt) {
    const empty = document.createElement('p');
    empty.className = 'hint';
    empty.textContent = 'Select an audio file first';
    formatList.appendChild(empty);
    return;
  }

  const filtered = formats.filter((f) => {
    if (!supported.includes(f.ext)) return false;
    if (q && !f.name.toLowerCase().includes(q) && !f.ext.includes(q)) return false;
    return true;
  });

  if (!filtered.length) {
    const empty = document.createElement('p');
    empty.className = 'hint';
    empty.textContent = q ? 'No matching formats' : 'No supported formats for this file';
    formatList.appendChild(empty);
    return;
  }

  const wrap = document.createElement('div');
  wrap.className = 'buttons';
  filtered.forEach((f, fi) => {
    const b = document.createElement('button');
    b.className = 'fmt' + (selectedFormat === f.name ? ' active' : '');
    b.dataset.name = f.name;
    b.dataset.ext = f.ext;
    b.textContent = f.name.toLowerCase();
    b.title = f.name + ' -> .' + f.ext;
    b.style.animation = 'pop .3s ease both';
    b.style.animationDelay = (fi * 0.02) + 's';
    b.onclick = () => selectFormat(f.name);
    wrap.appendChild(b);
  });
  formatList.appendChild(wrap);
}

function updateConvertBtn() {
  convertBtn.disabled = !(currentFile && selectedFormat);
}

function selectFormat(name) {
  if (selectedFormat === name) {
    selectedFormat = null;
  } else {
    selectedFormat = name;
  }
  document.querySelectorAll('.fmt').forEach((b) => {
    b.classList.toggle('active', b.dataset.name === selectedFormat);
  });
  updateConvertBtn();
}

formatSearch.addEventListener('input', () => renderFormats(formatSearch.value));

function handleFile(file) {
  if (!file) return;
  currentFile = file;
  clearError();
  fileName.textContent = file.name;
  fileSize.textContent = fmtSize(file.size);
  previewWrap.hidden = false;
  formatsCard.hidden = false;
  saveCard.hidden = false;
  resultCard.hidden = true;
  saveBtn.hidden = true;
  saveStatus.hidden = true;
  lastConvertedBlob = null;
  selectedFormat = null;
  currentFileExt = getFileExt(file.name);

  if (!isAudioFile(currentFileExt)) {
    showError('Only audio files are supported');
    formatsCard.hidden = true;
    saveCard.hidden = true;
    return;
  }

  renderFormats(formatSearch.value);
  updateConvertBtn();
  const url = URL.createObjectURL(file);
  preview.src = url;
}

previewWrap.addEventListener('click', () => {
  if (!previewWrap.hidden) resetAll();
});

$('browseBtn').addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
dropzone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('over'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('over'));
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('over');
  if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});

convertBtn.addEventListener('click', async () => {
  if (!currentFile || !selectedFormat) return;
  clearError();
  saveStatus.hidden = true;
  convertBtn.disabled = true;
  isConverting = true;
  btnLabel.textContent = 'Converting...';
  spinner.hidden = false;
  try {
    const res = await fetch('/api/convert', {
      method: 'POST',
      headers: {
        'Content-Type': currentFile.type || 'application/octet-stream',
        'X-Format': selectedFormat,
        'X-Filename': encodeURIComponent(currentFile.name)
      },
      body: currentFile
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || 'Conversion failed');
    }
    const blob = await res.blob();
    const ext = (formats.find((f) => f.name === selectedFormat) || {}).ext || '';
    lastConvertedBlob = blob;
    lastConvertedExt = ext;
    const url = URL.createObjectURL(blob);
    resultBox.innerHTML = '';
    const audio = document.createElement('audio');
    audio.src = url;
    audio.controls = true;
    audio.style.width = '100%';
    audio.style.borderRadius = '12px';
    resultBox.appendChild(audio);
    saveBtn.hidden = false;
    saveBtnLabel.textContent = 'Save (' + fmtSize(blob.size) + ')';
    resultCard.hidden = false;
  } catch (e) {
    showError(e.message);
  } finally {
    isConverting = false;
    convertBtn.disabled = false;
    btnLabel.textContent = 'Convert';
    spinner.hidden = true;
  }
});

saveBtn.addEventListener('click', async () => {
  if (!lastConvertedBlob) return;
  saveBtn.disabled = true;
  saveStatus.hidden = true;
  try {
    const dir = saveDir.value;
    const baseName = currentFile ? currentFile.name.replace(/\.[^.]+$/, '') : 'converted';
    const outName = baseName + '.' + lastConvertedExt;
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': lastConvertedBlob.type || 'application/octet-stream',
        'X-Save-Dir': dir,
        'X-Filename': encodeURIComponent(outName)
      },
      body: lastConvertedBlob
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Save failed');
    saveStatus.textContent = 'Saved: ' + data.path;
    saveStatus.className = 'save-status ok';
    saveStatus.hidden = false;
  } catch (e) {
    saveStatus.textContent = 'Error: ' + e.message;
    saveStatus.className = 'save-status err';
    saveStatus.hidden = false;
  } finally {
    saveBtn.disabled = false;
  }
});

const refreshModal = $('refreshModal');
const modalCancel = $('modalCancel');
const modalRefresh = $('modalRefresh');
let pendingRefresh = false;

window.addEventListener('beforeunload', (e) => {
  if (!isConverting) return;
  e.preventDefault();
  e.returnValue = '';
  refreshModal.hidden = false;
  pendingRefresh = true;
});

modalCancel.addEventListener('click', () => {
  refreshModal.hidden = true;
  pendingRefresh = false;
});

modalRefresh.addEventListener('click', () => {
  refreshModal.hidden = true;
  pendingRefresh = false;
  window.location.reload();
});

refreshModal.addEventListener('click', (e) => {
  if (e.target === refreshModal) {
    refreshModal.hidden = true;
    pendingRefresh = false;
  }
});
