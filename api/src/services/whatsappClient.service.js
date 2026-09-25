import axios from 'axios';
import { env } from '../config/env.js';

const graphClient = () =>
  axios.create({
    baseURL: `https://graph.facebook.com/${env.whatsapp.graphApiVersion}`,
    headers: { Authorization: `Bearer ${env.whatsapp.accessToken}` },
  });

export const sendTextMessage = async (to, text) => {
  await graphClient().post(`/${env.whatsapp.phoneNumberId}/messages`, {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  });
};

// Media downloads are a two-step Graph API dance: resolve the media id to a
// short-lived URL, then fetch the bytes from that URL with the same token.
export const downloadMedia = async (mediaId) => {
  const client = graphClient();
  const { data: meta } = await client.get(`/${mediaId}`);
  const { data: bytes } = await client.get(meta.url, { responseType: 'arraybuffer' });
  return Buffer.from(bytes);
};
