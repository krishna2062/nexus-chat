using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Nexus.API.Hubs
{
    [Authorize]
    public class CallHub : Hub
    {
        // WebRTC Signaling
        
        public async Task InitiateCall(string targetUserId, string offer, string callType)
        {
            await Clients.User(targetUserId).SendAsync("IncomingCall", new
            {
                CallerId = Context.UserIdentifier,
                Offer = offer,
                CallType = callType
            });
        }

        public async Task AnswerCall(string targetUserId, string answer)
        {
            await Clients.User(targetUserId).SendAsync("CallAnswered", new
            {
                ResponderId = Context.UserIdentifier,
                Answer = answer
            });
        }

        public async Task RejectCall(string targetUserId)
        {
            await Clients.User(targetUserId).SendAsync("CallRejected", Context.UserIdentifier);
        }

        public async Task EndCall(string targetUserId)
        {
            await Clients.User(targetUserId).SendAsync("CallEnded", Context.UserIdentifier);
        }

        public async Task SendIceCandidate(string targetUserId, string candidate)
        {
            await Clients.User(targetUserId).SendAsync("ReceiveIceCandidate", new
            {
                SenderId = Context.UserIdentifier,
                Candidate = candidate
            });
        }
    }
}
