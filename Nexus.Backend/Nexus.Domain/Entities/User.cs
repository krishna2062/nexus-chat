using System;
using System.Collections.Generic;

namespace Nexus.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string? Role { get; set; } // e.g., "Product Lead"
        public string? Bio { get; set; }
        public bool IsOnline { get; set; }
        public DateTime LastSeen { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Friendship> InitiatedFriendships { get; set; } = new List<Friendship>();
        public ICollection<Friendship> ReceivedFriendships { get; set; } = new List<Friendship>();
        public ICollection<ChatParticipant> ChatParticipants { get; set; } = new List<ChatParticipant>();
        public ICollection<Message> Messages { get; set; } = new List<Message>();
    }
}
