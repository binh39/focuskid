const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, 'uploads/')),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 40) || 'file';
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.toLowerCase().endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      role TEXT,
      email TEXT,
      xp INTEGER DEFAULT 0
    )`
  );

  db.run('ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0', () => {});

  db.run(
    `CREATE TABLE IF NOT EXISTS missions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      time_minutes INTEGER,
      parent_id INTEGER,
      file_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS subtasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mission_id INTEGER,
      title TEXT,
      completed INTEGER DEFAULT 0
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS mission_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mission_id INTEGER,
      file_path TEXT,
      original_name TEXT,
      time_minutes INTEGER,
      completed INTEGER DEFAULT 0
    )`
  );

  db.run('ALTER TABLE mission_files ADD COLUMN time_minutes INTEGER', () => {});

  db.run(
    `CREATE TABLE IF NOT EXISTS mission_quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mission_id INTEGER,
      question TEXT,
      option_a TEXT,
      option_b TEXT,
      option_c TEXT,
      option_d TEXT,
      correct_option TEXT,
      selected_option TEXT,
      completed INTEGER DEFAULT 0
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS reward_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      event_key TEXT,
      xp INTEGER,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, event_key)
    )`
  );
});

const normalizeUser = (row) => (row ? { ...row, xp: row.xp || 0 } : row);

const normalizeBoolRows = (rows) => rows.map((row) => ({ ...row, completed: Boolean(row.completed) }));

const normalizeFileRows = (rows) =>
  rows.map((row) => ({
    ...row,
    time_minutes: row.time_minutes ? Number(row.time_minutes) : null,
    completed: Boolean(row.completed),
  }));

const normalizeQuizRows = (rows) =>
  rows.map((row) => ({
    ...row,
    completed: Boolean(row.completed),
    selected_option: row.selected_option || null,
  }));

const parseQuizzes = (raw) => {
  let quizzes = [];
  try {
    quizzes = raw ? JSON.parse(raw) : [];
  } catch (_e) {
    quizzes = [];
  }

  return quizzes
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

const parseFileDurations = (raw, count, fallbackMinutes = 15) => {
  let values = [];
  try {
    values = raw ? JSON.parse(raw) : [];
  } catch (_e) {
    values = [];
  }

  const fallback = Math.max(1, parseInt(fallbackMinutes, 10) || 15);
  return Array.from({ length: count }, (_item, index) => {
    const minutes = Math.max(1, parseInt(values[index], 10) || fallback);
    return Math.min(minutes, 240);
  });
};

const getMissionPayload = (mission, callback) => {
  db.all('SELECT * FROM subtasks WHERE mission_id = ?', [mission.id], (subtaskErr, subtasks) => {
    if (subtaskErr) return callback(subtaskErr);

    db.all('SELECT * FROM mission_files WHERE mission_id = ?', [mission.id], (fileErr, files) => {
      if (fileErr) return callback(fileErr);

      db.all('SELECT * FROM mission_quizzes WHERE mission_id = ?', [mission.id], (quizErr, quizzes) => {
        if (quizErr) return callback(quizErr);
        callback(null, {
          ...mission,
          subtasks: normalizeBoolRows(subtasks),
          files: normalizeFileRows(files),
          quizzes: normalizeQuizRows(quizzes),
        });
      });
    });
  });
};

const getMissionById = (id, callback) => {
  db.get('SELECT * FROM missions WHERE id = ?', [id], (err, mission) => {
    if (err) return callback(err);
    if (!mission) return callback(null, null);
    getMissionPayload(mission, callback);
  });
};

const insertFiles = (missionId, files, durations, callback) => {
  const fileStmt = db.prepare('INSERT INTO mission_files (mission_id, file_path, original_name, time_minutes, completed) VALUES (?, ?, ?, ?, 0)');
  files.forEach((file, index) => {
    const storedPath = `/uploads/${path.basename(file.path)}`;
    fileStmt.run(missionId, storedPath, file.originalname || 'file', durations[index] || 15);
  });
  fileStmt.finalize(callback);
};

const insertQuizzes = (missionId, quizzes, callback) => {
  const quizStmt = db.prepare(
    `INSERT INTO mission_quizzes
      (mission_id, question, option_a, option_b, option_c, option_d, correct_option, selected_option, completed)
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 0)`,
  );
  quizzes.forEach((quiz) => {
    quizStmt.run(
      missionId,
      quiz.question,
      quiz.option_a,
      quiz.option_b,
      quiz.option_c,
      quiz.option_d,
      quiz.correct_option,
    );
  });
  quizStmt.finalize(callback);
};

const getUserById = (id, callback) => {
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) return callback(err);
    callback(null, normalizeUser(row));
  });
};

const awardXp = (userId, amount, reason, eventKey, callback) => {
  const xp = Math.max(1, Math.min(parseInt(amount, 10) || 0, 500));
  const key = String(eventKey || `${reason}:${Date.now()}`).slice(0, 180);
  const label = String(reason || 'Reward').slice(0, 120);

  db.run(
    'INSERT OR IGNORE INTO reward_events (user_id, event_key, xp, reason) VALUES (?, ?, ?, ?)',
    [userId, key, xp, label],
    function (insertErr) {
      if (insertErr) return callback(insertErr);

      const awarded = this.changes > 0;
      if (!awarded) {
        return getUserById(userId, (userErr, user) => {
          if (userErr) return callback(userErr);
          callback(null, { awarded: false, xp: 0, reason: label, event_key: key, user });
        });
      }

      db.run('UPDATE users SET xp = COALESCE(xp, 0) + ? WHERE id = ?', [xp, userId], (updateErr) => {
        if (updateErr) return callback(updateErr);

        getUserById(userId, (userErr, user) => {
          if (userErr) return callback(userErr);
          callback(null, { awarded: true, xp, reason: label, event_key: key, user });
        });
      });
    },
  );
};

app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(normalizeUser));
  });
});

app.post('/api/users', (req, res) => {
  const { name, role, email } = req.body;
  db.run('INSERT INTO users (name, role, email, xp) VALUES (?, ?, ?, 0)', [name, role, email], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, role, email, xp: 0 });
  });
});

app.get('/api/users/:id', (req, res) => {
  getUserById(req.params.id, (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
});

app.post('/api/users/:id/rewards', (req, res) => {
  const { xp, reason, event_key } = req.body;
  awardXp(req.params.id, xp, reason, event_key, (err, reward) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!reward.user) return res.status(404).json({ error: 'User not found' });
    res.json(reward);
  });
});

app.post('/api/login', (req, res) => {
  const { email, role } = req.body;
  db.get('SELECT * FROM users WHERE email = ? AND role = ?', [email, role], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json(normalizeUser(row));
  });
});

app.post('/api/missions', upload.array('files'), (req, res) => {
  const { title, time_minutes, parent_id, quizzes, file_durations } = req.body;
  const files = req.files || [];
  const parsedQuizzes = parseQuizzes(quizzes);
  const missionMinutes = time_minutes ? parseInt(time_minutes, 10) : null;
  const fileDurations = parseFileDurations(file_durations, files.length, missionMinutes || 15);

  db.run(
    'INSERT INTO missions (title, time_minutes, parent_id, file_path) VALUES (?, ?, ?, ?)',
    [title, missionMinutes, parent_id || null, null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      const missionId = this.lastID;

      insertFiles(missionId, files, fileDurations, (fileErr) => {
        if (fileErr) return res.status(500).json({ error: fileErr.message });

        insertQuizzes(missionId, parsedQuizzes, (quizErr) => {
          if (quizErr) return res.status(500).json({ error: quizErr.message });

          getMissionById(missionId, (missionErr, mission) => {
            if (missionErr) return res.status(500).json({ error: missionErr.message });
            res.json(mission);
          });
        });
      });
    },
  );
});

app.get('/api/missions', (req, res) => {
  db.all('SELECT * FROM missions ORDER BY created_at DESC', (err, missions) => {
    if (err) return res.status(500).json({ error: err.message });

    const fetchAll = missions.map((mission) => new Promise((resolve, reject) => {
      getMissionPayload(mission, (payloadErr, payload) => {
        if (payloadErr) return reject(payloadErr);
        resolve(payload);
      });
    }));

    Promise.all(fetchAll)
      .then((results) => res.json(results))
      .catch((error) => res.status(500).json({ error: error.message }));
  });
});

app.post('/api/missions/:id/files', upload.array('files'), (req, res) => {
  const { id } = req.params;
  const files = req.files || [];
  const fileDurations = parseFileDurations(req.body.file_durations, files.length, req.body.time_minutes || 15);

  insertFiles(id, files, fileDurations, (err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all('SELECT * FROM mission_files WHERE mission_id = ?', [id], (fileErr, filesRows) => {
      if (fileErr) return res.status(500).json({ error: fileErr.message });
      res.json({ files: normalizeFileRows(filesRows) });
    });
  });
});

app.post('/api/missions/:id/quizzes', (req, res) => {
  const { id } = req.params;
  const quizzes = parseQuizzes(JSON.stringify(req.body.quizzes || []));

  insertQuizzes(id, quizzes, (err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all('SELECT * FROM mission_quizzes WHERE mission_id = ?', [id], (quizErr, quizRows) => {
      if (quizErr) return res.status(500).json({ error: quizErr.message });
      res.json({ quizzes: normalizeQuizRows(quizRows) });
    });
  });
});

app.patch('/api/missions/:missionId/files/:fileId', (req, res) => {
  const { missionId, fileId } = req.params;
  const { completed, time_minutes } = req.body;
  const minutes = time_minutes ? Math.min(Math.max(parseInt(time_minutes, 10) || 15, 1), 240) : null;
  const params = minutes
    ? [completed ? 1 : 0, minutes, fileId, missionId]
    : [completed ? 1 : 0, fileId, missionId];
  const query = minutes
    ? 'UPDATE mission_files SET completed = ?, time_minutes = ? WHERE id = ? AND mission_id = ?'
    : 'UPDATE mission_files SET completed = ? WHERE id = ? AND mission_id = ?';

  db.run(query, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

app.patch('/api/missions/:missionId/quizzes/:quizId/answer', (req, res) => {
  const { missionId, quizId } = req.params;
  const answer = String(req.body.answer || '').trim().toUpperCase();
  const userId = req.body.user_id;

  if (!['A', 'B', 'C', 'D'].includes(answer)) {
    return res.status(400).json({ error: 'Answer must be A, B, C, or D' });
  }

  db.get('SELECT * FROM mission_quizzes WHERE id = ? AND mission_id = ?', [quizId, missionId], (err, quiz) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const correct = String(quiz.correct_option).toUpperCase() === answer;
    const wasCompleted = Boolean(quiz.completed);
    db.run(
      'UPDATE mission_quizzes SET selected_option = ?, completed = ? WHERE id = ? AND mission_id = ?',
      [answer, correct ? 1 : 0, quizId, missionId],
      function (updateErr) {
        if (updateErr) return res.status(500).json({ error: updateErr.message });

        db.get('SELECT * FROM mission_quizzes WHERE id = ? AND mission_id = ?', [quizId, missionId], (getErr, updatedQuiz) => {
          if (getErr) return res.status(500).json({ error: getErr.message });
          const payload = { ok: true, correct, quiz: normalizeQuizRows([updatedQuiz])[0] };

          if (!correct || wasCompleted || !userId) {
            return res.json(payload);
          }

          awardXp(userId, 40, 'Correct quiz answer', `quiz:${quizId}`, (rewardErr, reward) => {
            if (rewardErr) return res.status(500).json({ error: rewardErr.message });
            res.json({ ...payload, reward });
          });
        });
      },
    );
  });
});

app.delete('/api/missions/:missionId/quizzes/:quizId', (req, res) => {
  const { missionId, quizId } = req.params;
  db.run('DELETE FROM mission_quizzes WHERE id = ? AND mission_id = ?', [quizId, missionId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

app.delete('/api/missions/:missionId/files/:fileId', (req, res) => {
  const { missionId, fileId } = req.params;
  db.get('SELECT file_path FROM mission_files WHERE id = ? AND mission_id = ?', [fileId, missionId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row || !row.file_path) return res.status(404).json({ error: 'File not found' });

    const safePath = String(row.file_path).replace(/^\/+/, '');
    const fullPath = path.join(__dirname, safePath);

    fs.unlink(fullPath, (unlinkErr) => {
      if (unlinkErr && unlinkErr.code !== 'ENOENT') {
        return res.status(500).json({ error: unlinkErr.message });
      }

      db.run('DELETE FROM mission_files WHERE id = ? AND mission_id = ?', [fileId, missionId], function (updateErr) {
        if (updateErr) return res.status(500).json({ error: updateErr.message });
        res.json({ ok: true });
      });
    });
  });
});

app.delete('/api/missions/:id/file', (req, res) => {
  const { id } = req.params;
  db.get('SELECT file_path FROM missions WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row || !row.file_path) return res.status(404).json({ error: 'File not found' });

    const safePath = String(row.file_path).replace(/^\/+/, '');
    const fullPath = path.join(__dirname, safePath);

    fs.unlink(fullPath, (unlinkErr) => {
      if (unlinkErr && unlinkErr.code !== 'ENOENT') {
        return res.status(500).json({ error: unlinkErr.message });
      }

      db.run('UPDATE missions SET file_path = NULL WHERE id = ?', [id], function (updateErr) {
        if (updateErr) return res.status(500).json({ error: updateErr.message });
        res.json({ ok: true });
      });
    });
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
