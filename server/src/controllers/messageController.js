import { messageModel }                   from '../models/messageModel.js';
import { listingModel }                   from '../models/listingModel.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const messageController = {

  // ── GET /api/messages ──
  async getConversations(req, res) {
    try {
      const conversations = await messageModel.findConversationsByUser(req.user.id);
      return successResponse(res, { conversations });
    } catch (err) {
      return errorResponse(res, 'Failed to fetch conversations', 500);
    }
  },

  // ── POST /api/messages ──
  async startConversation(req, res) {
    try {
      const { listingId, hostId, message } = req.body;

      if (!message?.trim()) return errorResponse(res, 'Message is required to start a conversation', 400);

      const listing = await listingModel.findById(listingId);
      if (!listing) return errorResponse(res, 'Listing not found', 404);
      if (listing.host_id !== hostId) return errorResponse(res, 'Host does not match listing', 400);

      const conversation = await messageModel.findOrCreateConversation(
        listingId,
        req.user.id,
        hostId
      );

      await messageModel.sendMessage(conversation.id, req.user.id, message);

      return successResponse(res, { conversation }, 201);
    } catch (err) {
      console.error('Start conversation error:', err);
      return errorResponse(res, 'Failed to start conversation', 500);
    }
  },

  // ── GET /api/messages/:conversationId ──
  async getMessages(req, res) {
    try {
      const conversation = await messageModel.findConversationById(req.params.conversationId);
      if (!conversation) return errorResponse(res, 'Conversation not found', 404);

      const isParticipant = conversation.guest_id === req.user.id ||
                            conversation.host_id   === req.user.id;
      if (!isParticipant) return errorResponse(res, 'Not authorized', 403);

      const messages = await messageModel.findMessages(req.params.conversationId);
      await messageModel.markAsRead(req.params.conversationId, req.user.id);
      return successResponse(res, { messages });
    } catch (err) {
      return errorResponse(res, 'Failed to fetch messages', 500);
    }
  },

  // ── POST /api/messages/:conversationId ──
  async sendMessage(req, res) {
    try {
      const { body } = req.body;
      if (!body?.trim()) return errorResponse(res, 'Message body required', 400);

      const conversation = await messageModel.findConversationById(req.params.conversationId);
      if (!conversation) return errorResponse(res, 'Conversation not found', 404);

      const isParticipant = conversation.guest_id === req.user.id ||
                            conversation.host_id   === req.user.id;
      if (!isParticipant) return errorResponse(res, 'Not authorized', 403);

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