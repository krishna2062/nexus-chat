using System;
using Microsoft.AspNetCore.SignalR;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexus.Domain.Entities;
using Nexus.Infrastructure.Data;

namespace Nexus.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FriendsController : ControllerBase
    {
        private readonly NexusDbContext _context;
        private readonly Microsoft.AspNetCore.SignalR.IHubContext<Hubs.ChatHub> _hubContext;

        public FriendsController(NexusDbContext context, Microsoft.AspNetCore.SignalR.IHubContext<Hubs.ChatHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpPost("request/{addresseeId}")]
        public async Task<IActionResult> SendRequest(Guid addresseeId)
        {
            var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(currentUserIdStr, out var requesterId))
                return Unauthorized();

            if (requesterId == addresseeId)
                return BadRequest("You cannot send a friend request to yourself.");

            var existing = await _context.Friendships.FirstOrDefaultAsync(f => 
                (f.RequesterId == requesterId && f.AddresseeId == addresseeId) ||
                (f.RequesterId == addresseeId && f.AddresseeId == requesterId));

            if (existing != null)
                return BadRequest("A friendship status already exists.");

            var friendship = new Friendship
            {
                RequesterId = requesterId,
                AddresseeId = addresseeId,
                Status = FriendshipStatus.Pending
            };

            await _context.Friendships.AddAsync(friendship);
            await _context.SaveChangesAsync();

            var requester = await _context.Users.FindAsync(requesterId);
            if (requester != null)
            {
                await _hubContext.Clients.User(addresseeId.ToString()).SendAsync("NewFriendRequest", new
                {
                    Id = requester.Id,
                    Username = requester.Username,
                    FullName = requester.FullName,
                    AvatarUrl = requester.AvatarUrl
                });
            }

            return Ok(new { message = "Friend request sent." });
        }

        [HttpPost("accept/{requesterId}")]
        public async Task<IActionResult> AcceptRequest(Guid requesterId)
        {
            var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(currentUserIdStr, out var addresseeId))
                return Unauthorized();

            var friendship = await _context.Friendships.FirstOrDefaultAsync(f => 
                f.RequesterId == requesterId && f.AddresseeId == addresseeId && f.Status == FriendshipStatus.Pending);

            if (friendship == null)
                return NotFound("Pending request not found.");

            friendship.Status = FriendshipStatus.Accepted;
            friendship.UpdatedAt = DateTime.UtcNow;

            // Automatically create a private chat
            var existingChat = await _context.ChatParticipants
                .Where(cp => cp.UserId == requesterId || cp.UserId == addresseeId)
                .GroupBy(cp => cp.ChatId)
                .Where(g => g.Count() == 2)
                .Select(g => g.Key)
                .FirstOrDefaultAsync();

            if (existingChat == Guid.Empty)
            {
                var chat = new Chat
                {
                    Id = Guid.NewGuid(),
                    IsGroup = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _context.Chats.AddAsync(chat);

                await _context.ChatParticipants.AddRangeAsync(
                    new ChatParticipant { ChatId = chat.Id, UserId = requesterId, Role = "Member", JoinedAt = DateTime.UtcNow },
                    new ChatParticipant { ChatId = chat.Id, UserId = addresseeId, Role = "Member", JoinedAt = DateTime.UtcNow }
                );
            }

            await _context.SaveChangesAsync();

            var addressee = await _context.Users.FindAsync(addresseeId);
            if (addressee != null)
            {
                await _hubContext.Clients.User(requesterId.ToString()).SendAsync("FriendRequestAccepted", new
                {
                    Id = addressee.Id,
                    FullName = addressee.FullName
                });
            }

            return Ok(new { message = "Friend request accepted." });
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingRequests()
        {
            var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(currentUserIdStr, out var currentUserId))
                return Unauthorized();

            var pending = await _context.Friendships
                .Include(f => f.Requester)
                .Where(f => f.AddresseeId == currentUserId && f.Status == FriendshipStatus.Pending)
                .Select(f => new
                {
                    f.Requester.Id,
                    f.Requester.Username,
                    f.Requester.FullName,
                    f.Requester.AvatarUrl
                })
                .ToListAsync();

            return Ok(pending);
        }

        [HttpGet]
        public async Task<IActionResult> GetFriends()
        {
            var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(currentUserIdStr, out var currentUserId))
                return Unauthorized();

            var friends = await _context.Friendships
                .Include(f => f.Requester)
                .Include(f => f.Addressee)
                .Where(f => (f.RequesterId == currentUserId || f.AddresseeId == currentUserId) && f.Status == FriendshipStatus.Accepted)
                .Select(f => f.RequesterId == currentUserId ? f.Addressee : f.Requester)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.FullName,
                    u.AvatarUrl,
                    u.IsOnline
                })
                .ToListAsync();

            return Ok(friends);
        }
    }
}
