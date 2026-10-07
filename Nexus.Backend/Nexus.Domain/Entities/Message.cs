using System;

namespace Nexus.Domain.Entities
{
    public enum MessageType
    {
        Text,
        Image,
        Video,
        File,
        Audio
    }

    public class Message
    {
        public Guid Id { get; set; }
        public Guid ChatId { get; set; }
        public Chat Chat { get; set; } = null!;
        public Guid SenderId { get; set; }
        public User Sender { get; set; } = null!;
        public string? Content { get; set; }
        public MessageType Type { get; set; }
        public string? FileUrl { get; set; }
        public string? FileName { get; set; }
        public long? FileSize { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
