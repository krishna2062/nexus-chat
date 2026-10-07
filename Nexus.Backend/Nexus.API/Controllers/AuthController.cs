using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Nexus.Application.Interfaces;
using Nexus.Domain.Entities;
using BCrypt.Net;

namespace Nexus.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;

        public AuthController(IUserRepository userRepository, ITokenService tokenService)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
        }

        public record RegisterRequest(string Username, string FullName, string Email, string Password, string AvatarBase64);
        public record LoginRequest(string UsernameOrEmail, string Password);

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _userRepository.GetByEmailAsync(request.Email) != null)
                return BadRequest(new { message = "Email already in use." });

            if (await _userRepository.GetByUsernameAsync(request.Username) != null)
                return BadRequest(new { message = "Username already taken." });

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = request.Username,
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                AvatarUrl = request.AvatarBase64
            };

            await _userRepository.AddAsync(user);

            var token = _tokenService.GenerateToken(user);
            return Ok(new { Token = token, User = new { user.Id, user.Username, user.Email, user.FullName, user.AvatarUrl } });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _userRepository.GetByEmailAsync(request.UsernameOrEmail) 
                       ?? await _userRepository.GetByUsernameAsync(request.UsernameOrEmail);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid credentials." });

            var token = _tokenService.GenerateToken(user);
            return Ok(new { Token = token, User = new { user.Id, user.Username, user.Email, user.FullName, user.AvatarUrl } });
        }
    }
}
