using System.Linq.Expressions;
using BaseProject.UserManagement.Users;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Domain.Repositories.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore;

namespace BaseProject.UserManagement.EntityFrameworkCore.Repositories;

public class UserProfileRepository : EfCoreRepository<UserManagementDbContext, UserProfile, Guid>, IUserProfileRepository
{
    public UserProfileRepository(IDbContextProvider<UserManagementDbContext> dbContextProvider)
        : base(dbContextProvider)
    {
    }

    public async Task<UserProfile?> FindByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var dbSet = await GetDbSetAsync();
        return await dbSet.FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
    }
}
