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
    public class UsersController : ControllerBase
    {
        private readonly NexusDbContext _context;

        public UsersController(NexusDbContext context)
        {
            _context = context;
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query cannot be empty.");

            var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(currentUserIdStr, out var currentUserId))
                return Unauthorized();

            var users = await _context.Users
                .Where(u => u.Id != currentUserId && 
                            (u.Username.Contains(query) || u.FullName.Contains(query) || u.Email.Contains(query)))
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.FullName,
                    u.AvatarUrl,
                    u.Bio,
                    u.IsOnline
                })
                .Take(20)
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetProfile()
        {
            var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(currentUserIdStr, out var currentUserId))
                return Unauthorized();

            var user = await _context.Users
                .Where(u => u.Id == currentUserId)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.FullName,
                    u.Email,
                    u.AvatarUrl,
                    u.Bio
                })
                .FirstOrDefaultAsync();

            if (user == null) return NotFound();

            return Ok(user);
        }
        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(currentUserIdStr, out var currentUserId))
                return Unauthorized();

            var user = await _context.Users.FindAsync(currentUserId);
            if (user == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(request.FullName))
                user.FullName = request.FullName;
            if (!string.IsNullOrWhiteSpace(request.Bio))
                user.Bio = request.Bio;
            if (!string.IsNullOrWhiteSpace(request.AvatarBase64))
                user.AvatarUrl = request.AvatarBase64;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                user.Id,
                user.Username,
                user.FullName,
                user.Email,
                user.AvatarUrl,
                user.Bio
            });
        }
    }

    public class UpdateProfileRequest
    {
        public string? FullName { get; set; }
        public string? Bio { get; set; }
        public string? AvatarBase64 { get; set; }
    }
}
