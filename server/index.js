const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const {
  buildMissionFileObjectPath,
  extractStoragePathFromPublicUrl,
  normalizeBoolRows,
  normalizeFileRows,
  normalizeQuizRows,
  normalizeUser,
  parseFileDurations,
  parseQuizzes,
  toPublicFileUrl,
} = require('./lib/missionUtils');

const envFiles = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', 'supabase', '.env'),
];

for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile });
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'mission-files';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Configure Supabase before starting the server.');
  process.exit(1);
}

const supabaseBaseUrl = String(SUPABASE_URL).replace(/\/+$/, '');
const restBaseUrl = `${supabaseBaseUrl}/rest/v1`;
const storageBaseUrl = `${supabaseBaseUrl}/storage/v1`;
const supabaseHeaders = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
};
const jsonHeaders = {
  ...supabaseHeaders,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const makeUrl = (base, pathname) => new URL(pathname.replace(/^\/+/, ''), `${base}/`);

const encodeStoragePath = (objectPath) =>
  String(objectPath || '')
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

const supabaseRequest = async (base, pathname, options = {}) => {
  const url = makeUrl(base, pathname);
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers = { ...supabaseHeaders, ...(options.headers || {}) };
  let body = options.body;

  if (body && typeof body === 'object' && !Buffer.isBuffer(body) && !(body instanceof Uint8Array) && !(body instanceof FormData)) {
    body = JSON.stringify(body);
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body,
  });

  const rawText = await response.text();
  let payload = null;
  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch (_error) {
      payload = rawText;
    }
  }

  if (!response.ok) {
    const error = new Error(
      typeof payload === 'object' && payload && payload.message
        ? payload.message
        : typeof payload === 'string' && payload
          ? payload
          : `Supabase request failed with status ${response.status}`,
    );
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

const supabaseTable = async (table, options = {}) => {
  const query = { select: options.select || '*' };

  (options.filters || []).forEach(({ column, operator = 'eq', value }) => {
    query[column] = `${operator}.${value}`;
  });

  if (options.order) {
    query.order = options.order;
  }

  if (options.limit) {
    query.limit = options.limit;
  }

  const headers = { ...(options.headers || {}) };
  if (options.returnRepresentation) {
    headers.Prefer = 'return=representation';
  }

  return supabaseRequest(restBaseUrl, table, {
    method: options.method || 'GET',
    query,
    headers,
    body: options.body,
  });
};

const D = String.fromCharCode(36);

const crypto = require('crypto');

const PASSWORD_ITERATIONS = 120000;
const PASSWORD_KEYLEN = 32;
const PASSWORD_DIGEST = 'sha256';

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(String(password), salt, PASSWORD_ITERATIONS, PASSWORD_KEYLEN, PASSWORD_DIGEST)
    .toString('hex');
  return ['pbkdf2', PASSWORD_ITERATIONS, salt, hash].join(D);
};

const verifyPassword = (password, stored) => {
  if (!stored || typeof stored !== 'string') return false;
  const parts = stored.split(D);
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = parseInt(parts[1], 10) || PASSWORD_ITERATIONS;
  const salt = parts[2];
  const expected = parts[3];
  const candidate = crypto
    .pbkdf2Sync(String(password), salt, iterations, PASSWORD_KEYLEN, PASSWORD_DIGEST)
    .toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(candidate, 'hex'));
  } catch (_error) {
    return false;
  }
};

const sanitizeUser = (user) => {
  if (!user) return user;
  const { password_hash: _ignored, ...rest } = user;
  return rest;
};

const getUserById = async (id) => {
  const rows = await supabaseTable('users', {
    filters: [{ column: 'id', value: id }],
    limit: 1,
  });
  return normalizeUser(rows[0] || null);
};

const getUserByEmailAndRole = async (email, role) => {
  const rows = await supabaseTable('users', {
    filters: [
      { column: 'email', value: email },
      { column: 'role', value: role },
    ],
    limit: 1,
  });
  return normalizeUser(rows[0] || null);
};

const getUserByEmail = async (email) => {
  const rows = await supabaseTable('users', {
    filters: [{ column: 'email', value: email }],
    limit: 1,
  });
  return normalizeUser(rows[0] || null);
};

const getMissionRows = async (filters = [], order = 'created_at.desc') => {
  return supabaseTable('missions', { filters, order });
};

const getMissionRelations = async (missionId) => {
  const [subtasks, files, quizzes] = await Promise.all([
    supabaseTable('subtasks', {
      filters: [{ column: 'mission_id', value: missionId }],
      order: 'id.asc',
    }),
    supabaseTable('mission_files', {
      filters: [{ column: 'mission_id', value: missionId }],
      order: 'id.asc',
    }),
    supabaseTable('mission_quizzes', {
      filters: [{ column: 'mission_id', value: missionId }],
      order: 'id.asc',
    }),
  ]);

  return {
    subtasks: normalizeBoolRows(subtasks),
    files: normalizeFileRows(files, (row) => row.file_path || toPublicFileUrl(supabaseBaseUrl, SUPABASE_BUCKET, row.storage_path)),
    quizzes: normalizeQuizRows(quizzes),
  };
};

const getMissionById = async (id) => {
  const missionRows = await getMissionRows([{ column: 'id', value: id }], 'created_at.desc');
  const mission = missionRows[0] || null;
  if (!mission) return null;

  const relations = await getMissionRelations(mission.id);
  return {
    ...mission,
    ...relations,
  };
};

const uploadMissionFileToStorage = async (missionId, file) => {
  const objectPath = buildMissionFileObjectPath(missionId, file.originalname || 'file');
  const encodedPath = encodeStoragePath(objectPath);
  const uploadUrl = `${storageBaseUrl}/object/${encodeURIComponent(SUPABASE_BUCKET)}/${encodedPath}`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      ...supabaseHeaders,
      'Content-Type': file.mimetype || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: file.buffer,
  });

  const rawText = await response.text();
  if (!response.ok) {
    let payload = null;
    if (rawText) {
      try {
        payload = JSON.parse(rawText);
      } catch (_error) {
        payload = rawText;
      }
    }

    const error = new Error(
      typeof payload === 'object' && payload && payload.message
        ? payload.message
        : typeof payload === 'string' && payload
          ? payload
          : `Failed to upload ${file.originalname || 'file'} to Supabase storage`,
    );
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return {
    storage_path: objectPath,
    file_path: toPublicFileUrl(supabaseBaseUrl, SUPABASE_BUCKET, objectPath),
    original_name: file.originalname || 'file',
  };
};

const uploadMissionFiles = async (missionId, files, durations) => {
  const uploadedRows = [];
  for (let index = 0; index < files.length; index += 1) {
    const uploaded = await uploadMissionFileToStorage(missionId, files[index]);
    uploadedRows.push({
      mission_id: Number(missionId),
      storage_path: uploaded.storage_path,
      file_path: uploaded.file_path,
      original_name: uploaded.original_name,
      time_minutes: durations[index] || 15,
      completed: false,
    });
  }

  if (!uploadedRows.length) return [];

  await supabaseTable('mission_files', {
    method: 'POST',
    body: uploadedRows,
    returnRepresentation: true,
  });

  const rows = await supabaseTable('mission_files', {
    filters: [{ column: 'mission_id', value: missionId }],
    order: 'id.asc',
  });

  return normalizeFileRows(rows, (row) => row.file_path || toPublicFileUrl(supabaseBaseUrl, SUPABASE_BUCKET, row.storage_path));
};

const insertQuizzes = async (missionId, quizzes) => {
  if (!quizzes.length) return [];

  await supabaseTable('mission_quizzes', {
    method: 'POST',
    body: quizzes.map((quiz) => ({
      mission_id: Number(missionId),
      question: quiz.question,
      option_a: quiz.option_a,
      option_b: quiz.option_b,
      option_c: quiz.option_c,
      option_d: quiz.option_d,
      correct_option: quiz.correct_option,
      selected_option: null,
      completed: false,
    })),
    returnRepresentation: true,
  });

  const rows = await supabaseTable('mission_quizzes', {
    filters: [{ column: 'mission_id', value: missionId }],
    order: 'id.asc',
  });

  return normalizeQuizRows(rows);
};

const awardXp = async (userId, amount, reason, eventKey) => {
  const result = await supabaseRequest(restBaseUrl, 'rpc/award_user_xp', {
    method: 'POST',
    body: {
      target_user_id: Number(userId),
      award_amount: amount,
      award_reason: reason,
      award_event_key: eventKey,
    },
    headers: {
      Prefer: 'return=representation',
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  return {
    awarded: Boolean(result?.awarded),
    xp: Number(result?.xp || 0),
    reason: result?.reason || 'Reward',
    event_key: result?.event_key || eventKey || null,
    user: result?.user ? normalizeUser(result.user) : null,
  };
};

const deleteStorageObject = async (storagePath) => {
  if (!storagePath) return;

  const encodedPath = encodeStoragePath(storagePath);
  const deleteUrl = `${storageBaseUrl}/object/${encodeURIComponent(SUPABASE_BUCKET)}/${encodedPath}`;
  const response = await fetch(deleteUrl, {
    method: 'DELETE',
    headers: supabaseHeaders,
  });

  if (response.ok || response.status === 404) {
    return;
  }

  const rawText = await response.text();
  let payload = null;
  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch (_error) {
      payload = rawText;
    }
  }

  const error = new Error(
    typeof payload === 'object' && payload && payload.message
      ? payload.message
      : typeof payload === 'string' && payload
        ? payload
        : 'Failed to delete Supabase storage object',
  );
  error.status = response.status;
  error.payload = payload;
  throw error;
};

const deleteMissionFileById = async (missionId, fileId) => {
  const rows = await supabaseTable('mission_files', {
    filters: [
      { column: 'id', value: fileId },
      { column: 'mission_id', value: missionId },
    ],
    limit: 1,
  });
  const row = rows[0] || null;
  if (!row) return false;

  await deleteStorageObject(row.storage_path || extractStoragePathFromPublicUrl(supabaseBaseUrl, SUPABASE_BUCKET, row.file_path));

  await supabaseTable('mission_files', {
    method: 'DELETE',
    filters: [
      { column: 'id', value: fileId },
      { column: 'mission_id', value: missionId },
    ],
  });

  return true;
};

const deleteMissionCoverFile = async (missionId) => {
  const rows = await supabaseTable('missions', {
    filters: [{ column: 'id', value: missionId }],
    limit: 1,
  });
  const row = rows[0] || null;
  if (!row) return false;

  const storagePath = row.file_storage_path || extractStoragePathFromPublicUrl(supabaseBaseUrl, SUPABASE_BUCKET, row.file_path);
  await deleteStorageObject(storagePath);

  await supabaseTable('missions', {
    method: 'PATCH',
    filters: [{ column: 'id', value: missionId }],
    body: {
      file_path: null,
      file_storage_path: null,
    },
    returnRepresentation: true,
  });

  return true;
};

const updateMissionFile = async (missionId, fileId, completed, timeMinutes) => {
  const body = { completed: Boolean(completed) };
  if (timeMinutes !== null && timeMinutes !== undefined) {
    body.time_minutes = timeMinutes;
  }

  await supabaseTable('mission_files', {
    method: 'PATCH',
    filters: [
      { column: 'id', value: fileId },
      { column: 'mission_id', value: missionId },
    ],
    body,
    returnRepresentation: true,
  });
};

const updateQuizAnswer = async (missionId, quizId, answer) => {
  const rows = await supabaseTable('mission_quizzes', {
    filters: [
      { column: 'id', value: quizId },
      { column: 'mission_id', value: missionId },
    ],
    limit: 1,
  });
  const quiz = rows[0] || null;
  if (!quiz) return null;

  const correct = String(quiz.correct_option).toUpperCase() === answer;
  const wasCompleted = Boolean(quiz.completed);

  await supabaseTable('mission_quizzes', {
    method: 'PATCH',
    filters: [
      { column: 'id', value: quizId },
      { column: 'mission_id', value: missionId },
    ],
    body: {
      selected_option: answer,
      completed: correct,
    },
    returnRepresentation: true,
  });

  const updatedRows = await supabaseTable('mission_quizzes', {
    filters: [
      { column: 'id', value: quizId },
      { column: 'mission_id', value: missionId },
    ],
    limit: 1,
  });
  const updatedQuiz = updatedRows[0] || null;

  return {
    correct,
    wasCompleted,
    quiz: updatedQuiz ? normalizeQuizRows([updatedQuiz])[0] : null,
  };
};

const ensureStorageBucket = async () => {
  try {
    await supabaseRequest(storageBaseUrl, `bucket/${encodeURIComponent(SUPABASE_BUCKET)}`, {
      method: 'GET',
    });
    return;
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }
  }

  await supabaseRequest(storageBaseUrl, 'bucket', {
    method: 'POST',
    body: {
      id: SUPABASE_BUCKET,
      name: SUPABASE_BUCKET,
      public: true,
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
};

app.get('/api/users', async (_req, res) => {
  try {
    const rows = await supabaseTable('users', { order: 'id.asc' });
    res.json(rows.map((row) => sanitizeUser(normalizeUser(row))));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const role = String(req.body.role || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const parentEmailRaw = req.body.parent_email != null ? String(req.body.parent_email).trim().toLowerCase() : '';

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (role !== 'parent' && role !== 'child') {
      return res.status(400).json({ error: 'Role must be parent or child' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await getUserByEmailAndRole(email, role);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists for this role' });
    }

    let parentId = null;
    if (role === 'child') {
      if (!parentEmailRaw) {
        return res.status(400).json({ error: 'Parent email is required to create a child account' });
      }
      const parent = await getUserByEmailAndRole(parentEmailRaw, 'parent');
      if (!parent) {
        return res.status(400).json({ error: 'No parent account is registered with that email' });
      }
      parentId = parent.id;
    }

    const rows = await supabaseTable('users', {
      method: 'POST',
      body: {
        name,
        role,
        email,
        password_hash: hashPassword(password),
        parent_id: parentId,
        xp: 0,
      },
      returnRepresentation: true,
    });
    const user = sanitizeUser(normalizeUser(rows[0] || null));
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/:id/rewards', async (req, res) => {
  try {
    const { xp, reason, event_key } = req.body;
    const reward = await awardXp(req.params.id, xp, reason, event_key);
    if (!reward.user) return res.status(404).json({ error: 'User not found' });
    res.json(reward);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await getUserByEmail(email);
    if (!user || !user.password_hash) {
      return res.status(404).json({ error: 'Account not found. Create one to get started.' });
    }
    if (!verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Incorrect email or password' });
    }
    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/missions', upload.array('files'), async (req, res) => {
  try {
    const { title, time_minutes, parent_id, quizzes, file_durations } = req.body;
    const files = req.files || [];
    const parsedQuizzes = parseQuizzes(quizzes);
    const missionMinutes = time_minutes ? parseInt(time_minutes, 10) : null;
    const fileDurations = parseFileDurations(file_durations, files.length, missionMinutes || 15);
    const parentId = parent_id ? Number(parent_id) : null;

    const missionRows = await supabaseTable('missions', {
      method: 'POST',
      body: {
        title,
        time_minutes: missionMinutes,
        parent_id: parentId,
        file_path: null,
        file_storage_path: null,
      },
      returnRepresentation: true,
    });
    const missionId = missionRows[0]?.id;
    if (!missionId) {
      throw new Error('Failed to create mission record');
    }


    await uploadMissionFiles(missionId, files, fileDurations);
    await insertQuizzes(missionId, parsedQuizzes);

    const mission = await getMissionById(missionId);
    res.json(mission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/missions', async (_req, res) => {
  try {
    const missions = await getMissionRows();
    const withRelations = await Promise.all(missions.map((mission) => getMissionById(mission.id)));
    res.json(withRelations.filter(Boolean));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/missions/:id/files', upload.array('files'), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files || [];
    const fileDurations = parseFileDurations(req.body.file_durations, files.length, req.body.time_minutes || 15);

    await uploadMissionFiles(id, files, fileDurations);
    const missionFiles = await supabaseTable('mission_files', {
      filters: [{ column: 'mission_id', value: id }],
      order: 'id.asc',
    });
    res.json({ files: normalizeFileRows(missionFiles, (row) => row.file_path || toPublicFileUrl(supabaseBaseUrl, SUPABASE_BUCKET, row.storage_path)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/missions/:id/quizzes', async (req, res) => {
  try {
    const { id } = req.params;
    const quizzes = parseQuizzes(JSON.stringify(req.body.quizzes || []));
    await insertQuizzes(id, quizzes);
    const quizRows = await supabaseTable('mission_quizzes', {
      filters: [{ column: 'mission_id', value: id }],
      order: 'id.asc',
    });
    res.json({ quizzes: normalizeQuizRows(quizRows) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/missions/:missionId/files/:fileId', async (req, res) => {
  try {
    const { missionId, fileId } = req.params;
    const { completed, time_minutes } = req.body;
    const minutes = time_minutes ? Math.min(Math.max(parseInt(time_minutes, 10) || 15, 1), 240) : null;
    await updateMissionFile(missionId, fileId, completed, minutes);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/missions/:missionId/quizzes/:quizId/answer', async (req, res) => {
  try {
    const { missionId, quizId } = req.params;
    const answer = String(req.body.answer || '').trim().toUpperCase();
    const userId = req.body.user_id;

    if (!['A', 'B', 'C', 'D'].includes(answer)) {
      return res.status(400).json({ error: 'Answer must be A, B, C, or D' });
    }

    const result = await updateQuizAnswer(missionId, quizId, answer);
    if (!result) return res.status(404).json({ error: 'Quiz not found' });

    const payload = { ok: true, correct: result.correct, quiz: result.quiz };

    if (!result.correct || result.wasCompleted || !userId) {
      return res.json(payload);
    }

    const reward = await awardXp(userId, 40, 'Correct quiz answer', `quiz:${quizId}`);
    res.json({ ...payload, reward });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/missions/:missionId/quizzes/:quizId', async (req, res) => {
  try {
    const { missionId, quizId } = req.params;
    await supabaseTable('mission_quizzes', {
      method: 'DELETE',
      filters: [
        { column: 'id', value: quizId },
        { column: 'mission_id', value: missionId },
      ],
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/missions/:missionId/files/:fileId', async (req, res) => {
  try {
    const { missionId, fileId } = req.params;
    const deleted = await deleteMissionFileById(missionId, fileId);
    if (!deleted) return res.status(404).json({ error: 'File not found' });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/missions/:id/file', async (req, res) => {
  try {
    const deleted = await deleteMissionCoverFile(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'File not found' });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await ensureStorageBucket();
  app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
