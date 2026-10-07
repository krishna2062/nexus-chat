using System;
using System.Threading.Tasks;
using Nexus.Application.Interfaces;
using Nexus.Domain.Entities;
using Nexus.Infrastructure.Data;

namespace Nexus.Infrastructure.Repositories
{
    public class MessageRepository : IMessageRepository
    {
        private readonly NexusDbContext _context;

        public MessageRepository(NexusDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Message message)
        {
            await _context.Messages.AddAsync(message);
            await _context.SaveChangesAsync();
        }
    }
}
