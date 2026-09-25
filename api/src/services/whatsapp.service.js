import { User } from '../models/User.js';
import { WhatsAppSession } from '../models/WhatsAppSession.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { TN_DISTRICTS } from '../config/constants.js';
import { sendTextMessage, downloadMedia } from './whatsappClient.service.js';
import { matchSchemesForRequest } from './scheme.service.js';
import { getMyTimeline } from './timeline.service.js';
import { detectPest } from './pestDetection.service.js';

const MENU_TEXT =
  'நமஸ்காரம்! Reply with a number:\n1. திட்ட பொருத்தம் (Scheme match)\n2. பூச்சி/நோய் கண்டறிதல் (Pest detection)\n3. என் பயண காலவரிசை (My timeline)';

const NOT_REGISTERED_TEXT =
  'இந்த எண் பதிவு செய்யப்படவில்லை. முதலில் ஆப்பில் பதிவு செய்யவும்.\n(This number is not registered. Please register on the app first.)';

const getOrCreateSession = async (phoneNumber) => {
  let session = await WhatsAppSession.findOne({ phoneNumber });
  if (!session) {
    session = await WhatsAppSession.create({ phoneNumber, currentStep: 'menu', context: {} });
  }
  return session;
};

const resetToMenu = async (session) => {
  session.currentStep = 'menu';
  session.context = {};
  await session.save();
};

const findMatchedUser = (phoneNumber) =>
  User.findOne({ $or: [{ whatsappPhone: phoneNumber }, { phone: phoneNumber.slice(-10) }] });

const handleSchemeFlow = async (session, text, reply) => {
  const { currentStep, context } = session;

  if (currentStep === 'scheme_district') {
    const district = TN_DISTRICTS.find((d) => d.toLowerCase() === text.trim().toLowerCase());
    if (!district) {
      return reply(`Please reply with a valid Tamil Nadu district name, e.g. ${TN_DISTRICTS[0]}.`);
    }
    context.district = district;
    session.currentStep = 'scheme_land_size';
    await session.save();
    return reply('உங்கள் நில அளவு (ஏக்கரில்)? / What is your land size (in acres)?');
  }

  if (currentStep === 'scheme_land_size') {
    const size = Number(text);
    if (Number.isNaN(size) || size <= 0) {
      return reply('Please reply with a valid number, e.g. 2.5');
    }
    context.landSizeAcres = size;
    session.currentStep = 'scheme_crop';
    await session.save();
    return reply('நீங்கள் பயிரிடும் முக்கிய பயிர்? / What is your main crop?');
  }

  if (currentStep === 'scheme_crop') {
    context.crops = [text.trim()];
    const { matched } = await matchSchemesForRequest(null, context);
    await resetToMenu(session);

    if (!matched.length) {
      return reply('தற்போது பொருந்தும் திட்டங்கள் இல்லை. / No matching schemes found right now.');
    }
    const lines = matched.slice(0, 5).map((m) => `- ${m.scheme.name}`).join('\n');
    return reply(`பொருந்தும் திட்டங்கள்: / Matching schemes:\n${lines}`);
  }
};

const handlePestFlow = async (session, message, reply) => {
  if (message.type !== 'image') {
    return reply('பூச்சி/நோய் புகைப்படத்தை அனுப்பவும். / Please send a photo of the pest/crop issue.');
  }

  const buffer = await downloadMedia(message.image.id);
  const user = await findMatchedUser(session.phoneNumber);
  const { remedies, message: msg } = await detectPest(
    user._id.toString(),
    { buffer, originalname: 'whatsapp-photo.jpg' },
    { consentForTraining: false },
  );
  await resetToMenu(session);

  if (!remedies.length) {
    return reply(msg || 'Could not identify the issue confidently.');
  }
  const lines = remedies.map((r) => `- ${r.pestNameTa || r.pestName}: ${r.organicTreatments?.[0]?.method || ''}`).join('\n');
  return reply(`கண்டறியப்பட்டது: / Detected:\n${lines}`);
};

export const handleIncomingMessage = async (from, message) => {
  const reply = (text) => sendTextMessage(from, text);
  const session = await getOrCreateSession(from);

  const user = await findMatchedUser(from);
  if (!user) {
    return reply(NOT_REGISTERED_TEXT);
  }

  const text = message.text?.body?.trim();

  if (session.currentStep === 'menu') {
    if (text === '1') {
      session.currentStep = 'scheme_district';
      await session.save();
      return reply('உங்கள் மாவட்டம்? / What is your district?');
    }
    if (text === '2') {
      session.currentStep = 'pest_awaiting_photo';
      await session.save();
      return reply('பூச்சி/நோய் பாதிக்கப்பட்ட பயிரின் புகைப்படத்தை அனுப்பவும். / Send a photo of the affected crop.');
    }
    if (text === '3') {
      const profile = await FarmerProfile.findOne({ userId: user._id });
      if (!profile) return reply(NOT_REGISTERED_TEXT);
      const milestones = await getMyTimeline(user._id.toString());
      const current = milestones.find((m) => m.status === 'current') || milestones[0];
      return reply(`தற்போதைய கட்டம்: / Current stage:\n${current?.titleTa || current?.title || 'N/A'}`);
    }
    return reply(MENU_TEXT);
  }

  if (session.currentStep.startsWith('scheme_')) {
    return handleSchemeFlow(session, text || '', reply);
  }

  if (session.currentStep === 'pest_awaiting_photo') {
    return handlePestFlow(session, message, reply);
  }

  await resetToMenu(session);
  return reply(MENU_TEXT);
};
