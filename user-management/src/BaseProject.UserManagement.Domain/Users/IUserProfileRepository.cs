using Volo.Abp.Domain.Repositories;

namespace BaseProject.UserManagement.Users;

public interface IUserProfileRepository : IRepository<UserProfile, Guid>
{
    Task<UserProfile?> FindByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}
