using Microsoft.EntityFrameworkCore;
using Nexus.Domain.Entities;

namespace Nexus.Infrastructure.Data
{
    public class NexusDbContext : DbContext
    {
        public NexusDbContext(DbContextOptions<NexusDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Friendship> Friendships { get; set; } = null!;
        public DbSet<Chat> Chats { get; set; } = null!;
        public DbSet<ChatParticipant> ChatParticipants { get; set; } = null!;
        public DbSet<Message> Messages { get; set; } = null!;
        public DbSet<CallLog> CallLogs { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            // Friendship configuration
            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.Requester)
                .WithMany(u => u.InitiatedFriendships)
                .HasForeignKey(f => f.RequesterId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.Addressee)
                .WithMany(u => u.ReceivedFriendships)
                .HasForeignKey(f => f.AddresseeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Friendship>()
                .HasIndex(f => new { f.RequesterId, f.AddresseeId })
                .IsUnique();

            // ChatParticipant configuration
            modelBuilder.Entity<ChatParticipant>()
                .HasKey(cp => new { cp.ChatId, cp.UserId });

            modelBuilder.Entity<ChatParticipant>()
                .HasOne(cp => cp.Chat)
                .WithMany(c => c.Participants)
                .HasForeignKey(cp => cp.ChatId);

            modelBuilder.Entity<ChatParticipant>()
                .HasOne(cp => cp.User)
                .WithMany(u => u.ChatParticipants)
                .HasForeignKey(cp => cp.UserId);

            // Message configuration
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany(u => u.Messages)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Chat)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ChatId)
                .OnDelete(DeleteBehavior.Cascade);

            // CallLog configuration
            modelBuilder.Entity<CallLog>()
                .HasOne(c => c.Caller)
                .WithMany()
                .HasForeignKey(c => c.CallerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CallLog>()
                .HasOne(c => c.Receiver)
                .WithMany()
                .HasForeignKey(c => c.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
