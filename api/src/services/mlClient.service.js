import axios from 'axios';
import { env } from '../config/env.js';

const client = axios.create({
  baseURL: env.mlService.url,
  timeout: 15000,
  headers: { 'X-Internal-Key': env.mlService.internalKey },
});

// Node 20's native FormData/Blob globals — verified working against the
// FastAPI ml-service's multipart parsing, no need for the `form-data` package.
const requestOnce = async (buffer, filename) => {
  const form = new FormData();
  form.append('file', new Blob([buffer]), filename || 'photo.jpg');
  const res = await client.post('/predict', form);
  return res.data;
};

// One retry on transient failure (network blip, momentary 5xx from a
// cold-starting instance) — not on 4xx, which won't succeed on retry.
export const requestPrediction = async (buffer, filename) => {
  try {
    return await requestOnce(buffer, filename);
  } catch (err) {
    const status = err.response?.status;
    if (status && status < 500) throw err;
    return await requestOnce(buffer, filename);
  }
};
