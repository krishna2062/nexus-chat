using System;

namespace Nexus.Domain.Entities
{
    public enum CallType
    {
        Audio,
        Video
    }

    public enum CallStatus
    {
        Missed,
        Completed,
        Ongoing,
        Declined
    }

    public class CallLog
    {
        public Guid Id { get; set; }
        public Guid CallerId { get; set; }
        public User Caller { get; set; } = null!;
        public Guid ReceiverId { get; set; }
        public User Receiver { get; set; } = null!;
        public CallType Type { get; set; }
        public CallStatus Status { get; set; }
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? EndedAt { get; set; }
        public int? DurationSeconds { get; set; }
    }
}
