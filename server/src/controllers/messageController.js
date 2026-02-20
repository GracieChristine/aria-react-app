import { messageModel }               from '../models/messageModel.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const messageController = {
  async getConversations(req, res) {
    try {
      const conversations = await messageModel.findConversationsByUser(req.user.id);
      return successResponse(res, { conversations });
    } catch (err) {
      return errorResponse(res, 'Failed to fetch conversations', 500);
    }
  },

  async startConversation(req, res) {
    try {
      const { listingId, hostId, message } = req.body;
      const conversation = await messageModel.findOrCreateConversation(
        listingId,
        req.user.id,
        hostId
      );

      if (message) {
        await messageModel.sendMessage(conversation.id, req.user.id, message);
      }

      return successResponse(res, { conversation }, 201);
    } catch (err) {
      return errorResponse(res, 'Failed to start conversation', 500);
    }
  },

  async getMessages(req, res) {
    try {
      const messages = await messageModel.findMessages(req.params.conversationId);
      await messageModel.markAsRead(req.params.conversationId, req.user.id);
      return successResponse(res, { messages });
    } catch (err) {
      return errorResponse(res, 'Failed to fetch messages', 500);
    }
  },

  async sendMessage(req, res) {
    try {
      const { body } = req.body;
      if (!body?.trim()) return errorResponse(res, 'Message body required', 400);

      const message = await messageModel.sendMessage(
        req.params.conversationId,
        req.user.id,
        body
      );
      return successResponse(res, { message }, 201);
    } catch (err) {
      return errorResponse(res, 'Failed to send message', 500);
    }
  },
};