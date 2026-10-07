using System.Threading.Tasks;
using Nexus.Domain.Entities;

namespace Nexus.Application.Interfaces
{
    public interface ITokenService
    {
        string GenerateToken(User user);
    }
}
