const DEFAULT_VIETNAMESE_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const DEFAULT_ENGLISH_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
const MAX_TTS_TEXT_LENGTH = 1200;

const pickVoiceId = (language) => {
  const normalized = String(language || "").toLowerCase();
  if (normalized.startsWith("vi")) {
    return process.env.ELEVENLABS_VI_VOICE_ID || DEFAULT_VIETNAMESE_VOICE_ID;
  }
  return process.env.ELEVENLABS_EN_VOICE_ID || DEFAULT_ENGLISH_VOICE_ID;
};

const buildElevenLabsPayload = (text, _language) => ({
  text: String(text || "").trim().slice(0, MAX_TTS_TEXT_LENGTH),
  model_id: process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
  voice_settings: {
    stability: 0.55,
    similarity_boost: 0.75,
    style: 0.1,
    use_speaker_boost: true,
  },
});

module.exports = {
  buildElevenLabsPayload,
  pickVoiceId,
};
