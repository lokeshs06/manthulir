import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as inquiryService from '../services/inquiry.service.js';

export const createInquiryHandler = asyncHandler(async (req, res) => {
  const inquiry = await inquiryService.createInquiry(req.user.id, req.body);
  sendSuccess(res, { statusCode: 201, data: inquiry });
});

export const listMyInquiriesAsBuyerHandler = asyncHandler(async (req, res) => {
  const inquiries = await inquiryService.listMyInquiriesAsBuyer(req.user.id);
  sendSuccess(res, { data: inquiries });
});

export const listInquiriesForMyProduceHandler = asyncHandler(async (req, res) => {
  const inquiries = await inquiryService.listInquiriesForMyProduce(req.user.id);
  sendSuccess(res, { data: inquiries });
});

export const acceptInquiryHandler = asyncHandler(async (req, res) => {
  const inquiry = await inquiryService.acceptInquiry(req.user.id, req.params.id);
  sendSuccess(res, { data: inquiry });
});

export const rejectInquiryHandler = asyncHandler(async (req, res) => {
  const inquiry = await inquiryService.rejectInquiry(req.user.id, req.params.id);
  sendSuccess(res, { data: inquiry });
});

export const getRevealedContactHandler = asyncHandler(async (req, res) => {
  const contact = await inquiryService.getRevealedContact(req.user.id, req.params.id);
  sendSuccess(res, { data: contact });
});
