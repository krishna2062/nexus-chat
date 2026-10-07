using System;
using System.Threading.Tasks;
using Nexus.Domain.Entities;

namespace Nexus.Application.Interfaces
{
    public interface IMessageRepository
    {
        Task AddAsync(Message message);
    }
}
