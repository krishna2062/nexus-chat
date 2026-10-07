using System;

namespace Nexus.Domain.Entities
{
    public enum FriendshipStatus
    {
        Pending,
        Accepted,
        Declined,
        Blocked
    }

    public class Friendship
    {
        public Guid Id { get; set; }
        public Guid RequesterId { get; set; }
        public User Requester { get; set; } = null!;
        public Guid AddresseeId { get; set; }
        public User Addressee { get; set; } = null!;
        public FriendshipStatus Status { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
