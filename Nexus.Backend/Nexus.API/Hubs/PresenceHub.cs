using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace Nexus.API.Hubs
{
    [Authorize]
    public class PresenceHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            if (userId != null)
            {
                await Clients.All.SendAsync("UserPresenceChanged", userId, true, DateTime.UtcNow);
                // In a real app, update DB IsOnline = true
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier;
            if (userId != null)
            {
                await Clients.All.SendAsync("UserPresenceChanged", userId, false, DateTime.UtcNow);
                // In a real app, update DB IsOnline = false, LastSeen = DateTime.UtcNow
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
