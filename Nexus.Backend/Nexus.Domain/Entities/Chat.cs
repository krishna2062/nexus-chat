using System;
using System.Collections.Generic;

namespace Nexus.Domain.Entities
{
    public class Chat
    {
        public Guid Id { get; set; }
        public bool IsGroup { get; set; }
        public string? Name { get; set; } // Null for direct chats
        public string? AvatarUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<ChatParticipant> Participants { get; set; } = new List<ChatParticipant>();
        public ICollection<Message> Messages { get; set; } = new List<Message>();
    }
}
