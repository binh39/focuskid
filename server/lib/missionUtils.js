const crypto = require('crypto');

const MAX_FILE_MINUTES = 240;
const MIN_FILE_MINUTES = 1;
const DEFAULT_FILE_MINUTES = 15;

const parseJsonArray = (raw) => {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
};

const parseQuizzes = (raw) => {
  return parseJsonArray(raw)
    .map((quiz) => ({
      question: String(quiz.question || '').trim(),
      option_a: String(quiz.option_a || '').trim(),
      option_b: String(quiz.option_b || '').trim(),
      option_c: String(quiz.option_c || '').trim(),
      option_d: String(quiz.option_d || '').trim(),
      correct_option: String(quiz.correct_option || 'A').trim().toUpperCase(),
    }))
    .filter(
      (quiz) =>
        quiz.question &&
        quiz.option_a &&
        quiz.option_b &&
        quiz.option_c &&
        quiz.option_d &&
        ['A', 'B', 'C', 'D'].includes(quiz.correct_option),
    );
};

const parseFileDurations = (raw, count, fallbackMinutes = DEFAULT_FILE_MINUTES) => {
  const values = parseJsonArray(raw);
  const fallback = Math.max(MIN_FILE_MINUTES, parseInt(fallbackMinutes, 10) || DEFAULT_FILE_MINUTES);

  return Array.from({ length: count }, (_item, index) => {
    const minutes = Math.max(MIN_FILE_MINUTES, parseInt(values[index], 10) || fallback);
    return Math.min(minutes, MAX_FILE_MINUTES);
  });
};

const normalizeUser = (row) => (row ? { ...row, xp: Number(row.xp || 0) } : row);

const normalizeBoolRows = (rows) => rows.map((row) => ({ ...row, completed: Boolean(row.completed) }));

const normalizeFileRows = (rows, resolveFilePath) =>
  rows.map((row) => ({
    ...row,
    time_minutes: row.time_minutes != null ? Number(row.time_minutes) : null,
    completed: Boolean(row.completed),
    file_path: resolveFilePath ? resolveFilePath(row) : row.file_path,
  }));

const normalizeQuizRows = (rows) =>
  rows.map((row) => ({
    ...row,
    completed: Boolean(row.completed),
    selected_option: row.selected_option || null,
  }));

const sanitizeFileName = (name) => {
  const ext = String(name ? name : '').includes('.') ? `.${String(name).split('.').pop()}` : '';
  const base = String(name || 'file')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .slice(0, 40) || 'file';
  return `${base}${ext}`;
};

const buildMissionFileObjectPath = (missionId, originalName) => {
  const safeName = sanitizeFileName(originalName);
  return `missions/${missionId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
};

const toPublicFileUrl = (supabaseUrl, bucket, storagePath) => {
  if (!storagePath) return null;
  if (/^https?:\/\//i.test(storagePath)) return storagePath;
  const trimmedBase = String(supabaseUrl || '').replace(/\/+$/, '');
  return `${trimmedBase}/storage/v1/object/public/${bucket}/${storagePath}`;
};

const extractStoragePathFromPublicUrl = (supabaseUrl, bucket, filePath) => {
  if (!filePath) return null;
  if (!/^https?:\/\//i.test(filePath)) return String(filePath).replace(/^\/+/, '');

  try {
    const url = new URL(filePath);
    const basePath = `/storage/v1/object/public/${bucket}/`;
    if (url.pathname.startsWith(basePath)) {
      return decodeURIComponent(url.pathname.slice(basePath.length));
    }
  } catch (_error) {
    // ignore malformed urls
  }

  const base = String(supabaseUrl || '').replace(/\/+$/, '');
  const publicPrefix = `${base}/storage/v1/object/public/${bucket}/`;
  if (String(filePath).startsWith(publicPrefix)) {
    return decodeURIComponent(String(filePath).slice(publicPrefix.length));
  }

  return null;
};

module.exports = {
  buildMissionFileObjectPath,
  extractStoragePathFromPublicUrl,
  normalizeBoolRows,
  normalizeFileRows,
  normalizeQuizRows,
  normalizeUser,
  parseFileDurations,
  parseQuizzes,
  sanitizeFileName,
  toPublicFileUrl,
};
