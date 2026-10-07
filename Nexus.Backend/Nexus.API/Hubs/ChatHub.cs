using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Nexus.API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly Nexus.Application.Interfaces.IMessageRepository _messageRepository;

        public ChatHub(Nexus.Application.Interfaces.IMessageRepository messageRepository)
        {
            _messageRepository = messageRepository;
        }

        public async Task SendMessage(string chatId, string message, string type)
        {
            var userIdStr = Context.UserIdentifier;
            if (System.Guid.TryParse(userIdStr, out System.Guid userId) && System.Guid.TryParse(chatId, out System.Guid parsedChatId))
            {
                var msg = new Nexus.Domain.Entities.Message
                {
                    Id = System.Guid.NewGuid(),
                    ChatId = parsedChatId,
                    SenderId = userId,
                    Content = message,
                    Type = Enum.TryParse<Nexus.Domain.Entities.MessageType>(type, true, out var parsedType) ? parsedType : Nexus.Domain.Entities.MessageType.Text,
                    CreatedAt = System.DateTime.UtcNow
                };
                await _messageRepository.AddAsync(msg);
            }

            // Then broadcast to clients in the chat group
            await Clients.Group(chatId).SendAsync("ReceiveMessage", new 
            {
                SenderId = Context.UserIdentifier,
                ChatId = chatId,
                Content = message,
                Type = type,
                CreatedAt = System.DateTime.UtcNow
            });
        }

        public async Task JoinChatGroup(string chatId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, chatId);
        }

        public async Task LeaveChatGroup(string chatId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatId);
        }

        public async Task SendTypingStatus(string chatId, bool isTyping)
        {
            await Clients.Group(chatId).SendAsync("TypingStatus", Context.UserIdentifier, isTyping);
        }

        public async Task ReadMessage(string chatId, string messageId)
        {
            await Clients.Group(chatId).SendAsync("MessageRead", Context.UserIdentifier, messageId);
        }

        // WebRTC Signaling
        public async Task CallUser(string targetUserId, string type) // type: "audio" or "video"
        {
            await Clients.User(targetUserId).SendAsync("IncomingCall", Context.UserIdentifier, type);
        }

        public async Task AnswerCall(string targetUserId)
        {
            await Clients.User(targetUserId).SendAsync("CallAnswered", Context.UserIdentifier);
        }

        public async Task RejectCall(string targetUserId)
        {
            await Clients.User(targetUserId).SendAsync("CallRejected", Context.UserIdentifier);
        }

        public async Task EndCall(string targetUserId)
        {
            await Clients.User(targetUserId).SendAsync("CallEnded", Context.UserIdentifier);
        }

        public async Task SendSignal(string targetUserId, string signal)
        {
            await Clients.User(targetUserId).SendAsync("ReceiveSignal", Context.UserIdentifier, signal);
        }
    }
}
