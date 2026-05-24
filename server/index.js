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
      email TEXT
    )`
  );

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
      completed INTEGER DEFAULT 0
    )`
  );

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
});

const normalizeBoolRows = (rows) => rows.map((row) => ({ ...row, completed: Boolean(row.completed) }));

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
          files: normalizeBoolRows(files),
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

const insertFiles = (missionId, files, callback) => {
  const fileStmt = db.prepare('INSERT INTO mission_files (mission_id, file_path, original_name, completed) VALUES (?, ?, ?, 0)');
  files.forEach((file) => {
    const storedPath = `/uploads/${path.basename(file.path)}`;
    fileStmt.run(missionId, storedPath, file.originalname || 'file');
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

app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/users', (req, res) => {
  const { name, role, email } = req.body;
  db.run('INSERT INTO users (name, role, email) VALUES (?, ?, ?)', [name, role, email], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, role, email });
  });
});

app.post('/api/login', (req, res) => {
  const { email, role } = req.body;
  db.get('SELECT * FROM users WHERE email = ? AND role = ?', [email, role], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  });
});

app.post('/api/missions', upload.array('files'), (req, res) => {
  const { title, time_minutes, parent_id, quizzes } = req.body;
  const files = req.files || [];
  const parsedQuizzes = parseQuizzes(quizzes);

  db.run(
    'INSERT INTO missions (title, time_minutes, parent_id, file_path) VALUES (?, ?, ?, ?)',
    [title, time_minutes ? parseInt(time_minutes) : null, parent_id || null, null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      const missionId = this.lastID;

      insertFiles(missionId, files, (fileErr) => {
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

  insertFiles(id, files, (err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all('SELECT * FROM mission_files WHERE mission_id = ?', [id], (fileErr, filesRows) => {
      if (fileErr) return res.status(500).json({ error: fileErr.message });
      res.json({ files: normalizeBoolRows(filesRows) });
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
  const { completed } = req.body;
  db.run('UPDATE mission_files SET completed = ? WHERE id = ? AND mission_id = ?', [completed ? 1 : 0, fileId, missionId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

app.patch('/api/missions/:missionId/quizzes/:quizId/answer', (req, res) => {
  const { missionId, quizId } = req.params;
  const answer = String(req.body.answer || '').trim().toUpperCase();

  if (!['A', 'B', 'C', 'D'].includes(answer)) {
    return res.status(400).json({ error: 'Answer must be A, B, C, or D' });
  }

  db.get('SELECT * FROM mission_quizzes WHERE id = ? AND mission_id = ?', [quizId, missionId], (err, quiz) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const correct = String(quiz.correct_option).toUpperCase() === answer;
    db.run(
      'UPDATE mission_quizzes SET selected_option = ?, completed = ? WHERE id = ? AND mission_id = ?',
      [answer, correct ? 1 : 0, quizId, missionId],
      function (updateErr) {
        if (updateErr) return res.status(500).json({ error: updateErr.message });

        db.get('SELECT * FROM mission_quizzes WHERE id = ? AND mission_id = ?', [quizId, missionId], (getErr, updatedQuiz) => {
          if (getErr) return res.status(500).json({ error: getErr.message });
          res.json({ ok: true, correct, quiz: normalizeQuizRows([updatedQuiz])[0] });
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
