const test = require('node:test');
const assert = require('node:assert/strict');
const { buildElevenLabsPayload, pickVoiceId } = require('./ttsUtils');

test('pickVoiceId prefers Vietnamese voice for Vietnamese language', () => {
  assert.equal(pickVoiceId('vi-VN'), '21m00Tcm4TlvDq8ikWAM');
});

test('pickVoiceId prefers English voice for English language', () => {
  assert.equal(pickVoiceId('en-US'), 'EXAVITQu4vr4xnSDxMaL');
});

test('buildElevenLabsPayload clamps text and sets stable model options', () => {
  const payload = buildElevenLabsPayload('  Xin chào '.repeat(200), 'vi-VN');

  assert.equal(payload.text.length, 1200);
  assert.equal(payload.model_id, 'eleven_multilingual_v2');
  assert.deepEqual(payload.voice_settings, {
    stability: 0.55,
    similarity_boost: 0.75,
    style: 0.1,
    use_speaker_boost: true,
  });
});
