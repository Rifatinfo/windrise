import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../errors/ApiError";
import { ChatbotService } from "./chatbot.service";

const ok = (res: Response, message: string, data: unknown) =>
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message, data });

/**
 * The widget is used by signed-out visitors, so these routes are public. Where
 * a session belongs to a signed-in user, `req.user` is populated by the
 * optional auth middleware and passed through for order attribution.
 */
type MaybeAuthed = Request & { user?: { id?: string; email?: string } };

const start = catchAsync(async (req: MaybeAuthed, res: Response) => {
  const { visitorId, ...payload } = req.body;
  ok(
    res,
    "Chat ready",
    await ChatbotService.startSession(payload, {
      visitorId,
      userId: req.user?.id,
      userEmail: req.user?.email,
    }),
  );
});

const getSession = catchAsync(async (req: Request, res: Response) => {
  const visitorId = String(req.query.visitorId ?? "");
  if (!visitorId) throw new ApiError(StatusCodes.BAD_REQUEST, "Missing visitor id");

  ok(
    res,
    "Chat fetched",
    await ChatbotService.getSession(req.params.sessionId as string, visitorId),
  );
});

const sendMessage = catchAsync(async (req: MaybeAuthed, res: Response) => {
  const { visitorId, sessionId, text, imageUrl } = req.body;

  if (!text && !imageUrl) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Send a message or an image");
  }

  ok(
    res,
    "Reply ready",
    await ChatbotService.sendMessage(
      { sessionId, text, imageUrl },
      { visitorId, userId: req.user?.id, userEmail: req.user?.email },
    ),
  );
});

const confirmPending = catchAsync(async (req: MaybeAuthed, res: Response) => {
  const { visitorId, sessionId } = req.body;
  ok(
    res,
    'Confirmed',
    await ChatbotService.confirmPending(sessionId, {
      visitorId,
      userId: req.user?.id,
      userEmail: req.user?.email,
    }),
  );
});

const declinePending = catchAsync(async (req: Request, res: Response) => {
  const { visitorId, sessionId } = req.body;
  ok(res, 'Declined', await ChatbotService.declinePending(sessionId, visitorId));
});

const requestHuman = catchAsync(async (req: Request, res: Response) => {
  const { visitorId, sessionId } = req.body;
  ok(res, "Support requested", await ChatbotService.requestHuman(sessionId, visitorId));
});

const resumeAi = catchAsync(async (req: Request, res: Response) => {
  const { visitorId, sessionId } = req.body;
  ok(res, "Back with Windee", await ChatbotService.resumeAi(sessionId, visitorId));
});

const closeSession = catchAsync(async (req: Request, res: Response) => {
  const { visitorId, sessionId } = req.body;
  ok(res, "Chat closed", await ChatbotService.closeSession(sessionId, visitorId));
});

const uploadImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) throw new ApiError(StatusCodes.BAD_REQUEST, "No image uploaded");
  ok(res, "Image uploaded", await ChatbotService.uploadImage(req.file));
});

export const ChatbotController = {
  start,
  confirmPending,
  declinePending,
  getSession,
  sendMessage,
  requestHuman,
  resumeAi,
  closeSession,
  uploadImage,
};
