using System;
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
    public class ChatsController : ControllerBase
    {
        private readonly NexusDbContext _context;

        public ChatsController(NexusDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetChats()
        {
            var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(currentUserIdStr, out var currentUserId))
                return Unauthorized();

            var chats = await _context.Chats
                .Include(c => c.Participants)
                    .ThenInclude(p => p.User)
                .Include(c => c.Messages.OrderByDescending(m => m.CreatedAt).Take(1))
                .Where(c => c.Participants.Any(p => p.UserId == currentUserId))
                .Select(c => new
                {
                    c.Id,
                    c.IsGroup,
                    Name = c.IsGroup ? c.Name : c.Participants.First(p => p.UserId != currentUserId).User.FullName,
                    Avatar = c.IsGroup ? c.AvatarUrl : c.Participants.First(p => p.UserId != currentUserId).User.AvatarUrl,
                    IsOnline = !c.IsGroup && c.Participants.First(p => p.UserId != currentUserId).User.IsOnline,
                    LastMessage = c.Messages.FirstOrDefault() != null ? c.Messages.FirstOrDefault()!.Content : "",
                    Time = c.Messages.FirstOrDefault() != null ? c.Messages.FirstOrDefault()!.CreatedAt.ToString("o") : c.CreatedAt.ToString("o"),
                    Unread = c.Messages.Count(m => !m.IsRead && m.SenderId != currentUserId)
                })
                .ToListAsync();

            return Ok(chats.OrderByDescending(c => c.Time));
        }

        [HttpGet("{chatId}/messages")]
        public async Task<IActionResult> GetMessages(Guid chatId)
        {
            var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(currentUserIdStr, out var currentUserId))
                return Unauthorized();

            var isParticipant = await _context.ChatParticipants.AnyAsync(cp => cp.ChatId == chatId && cp.UserId == currentUserId);
            if (!isParticipant) return Forbid();

            var messages = await _context.Messages
                .Include(m => m.Sender)
                .Where(m => m.ChatId == chatId)
                .OrderBy(m => m.CreatedAt)
                .Select(m => new
                {
                    m.Id,
                    m.Content,
                    m.Type,
                    m.FileUrl,
                    m.FileName,
                    m.FileSize,
                    Time = m.CreatedAt.ToString("o"),
                    Incoming = m.SenderId != currentUserId,
                    SenderAvatar = m.Sender.AvatarUrl
                })
                .ToListAsync();

            return Ok(messages);
        }

        [HttpPost("{chatId}/read")]
        public async Task<IActionResult> MarkAsRead(Guid chatId)
        {
            var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(currentUserIdStr, out var currentUserId))
                return Unauthorized();

            var messages = await _context.Messages
                .Where(m => m.ChatId == chatId && m.SenderId != currentUserId && !m.IsRead)
                .ToListAsync();

            if (messages.Any())
            {
                foreach (var msg in messages)
                {
                    msg.IsRead = true;
                }
                await _context.SaveChangesAsync();
            }

            return Ok(new { success = true });
        }
    }
}
