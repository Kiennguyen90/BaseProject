using AutoMapper;
using BaseProject.UserManagement.Users;
using BaseProject.UserManagement.Users.Dtos;

namespace BaseProject.UserManagement;

public class BaseProjectUserManagementApplicationAutoMapperProfile : Profile
{
    public BaseProjectUserManagementApplicationAutoMapperProfile()
    {
        CreateMap<UserProfile, UserProfileDto>();
    }
}
