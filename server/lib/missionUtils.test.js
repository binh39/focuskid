const test = require('node:test');
const assert = require('node:assert/strict');
const {
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
} = require('./missionUtils');

test('parseQuizzes keeps only valid quizzes', () => {
  const quizzes = parseQuizzes(
    JSON.stringify([
      {
        question: ' 2 + 2? ',
        option_a: '3',
        option_b: '4',
        option_c: '5',
        option_d: '6',
        correct_option: 'b',
      },
      {
        question: '',
        option_a: 'A',
        option_b: 'B',
        option_c: 'C',
        option_d: 'D',
        correct_option: 'A',
      },
    ]),
  );

  assert.deepEqual(quizzes, [
    {
      question: '2 + 2?',
      option_a: '3',
      option_b: '4',
      option_c: '5',
      option_d: '6',
      correct_option: 'B',
    },
  ]);
});

test('parseFileDurations clamps values', () => {
  assert.deepEqual(parseFileDurations(JSON.stringify([0, 99, 500]), 3, 20), [20, 99, 240]);
});

test('normalize helpers keep expected shape', () => {
  assert.deepEqual(normalizeUser({ id: 1, xp: null }), { id: 1, xp: 0 });
  assert.deepEqual(normalizeBoolRows([{ completed: 1 }]), [{ completed: true }]);
  assert.deepEqual(normalizeQuizRows([{ completed: 0, selected_option: '' }]), [
    { completed: false, selected_option: null },
  ]);
  assert.deepEqual(normalizeFileRows([{ time_minutes: '12', completed: 0, file_path: 'x' }], (row) => row.file_path), [
    { time_minutes: 12, completed: false, file_path: 'x' },
  ]);
});

test('storage url helpers round-trip paths', () => {
  const baseUrl = 'https://demo.supabase.co';
  const bucket = 'mission-files';
  const storagePath = 'missions/7/example.pdf';
  const publicUrl = toPublicFileUrl(baseUrl, bucket, storagePath);

  assert.equal(publicUrl, 'https://demo.supabase.co/storage/v1/object/public/mission-files/missions/7/example.pdf');
  assert.equal(extractStoragePathFromPublicUrl(baseUrl, bucket, publicUrl), storagePath);
});

test('sanitizeFileName trims unsafe characters', () => {
  assert.equal(sanitizeFileName('../../My file!.pdf'), 'Myfile.pdf');
  assert.match(buildMissionFileObjectPath(9, 'My file!.pdf'), /^missions\/9\/\d+-[0-9a-f-]+-Myfile\.pdf$/);
});
