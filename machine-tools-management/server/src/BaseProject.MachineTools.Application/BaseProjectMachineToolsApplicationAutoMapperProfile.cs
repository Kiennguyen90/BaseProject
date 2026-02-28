using AutoMapper;
using BaseProject.MachineTools.Borrowing;
using BaseProject.MachineTools.Borrowing.Dtos;
using BaseProject.MachineTools.Devices;
using BaseProject.MachineTools.Devices.Dtos;
using BaseProject.MachineTools.Transactions;
using BaseProject.MachineTools.Transactions.Dtos;

namespace BaseProject.MachineTools;

public class BaseProjectMachineToolsApplicationAutoMapperProfile : Profile
{
    public BaseProjectMachineToolsApplicationAutoMapperProfile()
    {
        CreateMap<Device, DeviceDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty));

        CreateMap<DeviceCategory, DeviceCategoryDto>()
            .ForMember(dest => dest.DeviceCount, opt => opt.MapFrom(src => src.Devices != null ? src.Devices.Count : 0));

        CreateMap<DeviceImage, DeviceImageDto>();

        CreateMap<BorrowRequest, BorrowRequestDto>()
            .ForMember(dest => dest.DeviceName, opt => opt.MapFrom(src => src.Device != null ? src.Device.Name : string.Empty))
            .ForMember(dest => dest.DeviceCode, opt => opt.MapFrom(src => src.Device != null ? src.Device.Code : string.Empty))
            .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee != null ? src.Employee.FullName : string.Empty))
            .ForMember(dest => dest.EmployeeCode, opt => opt.MapFrom(src => src.Employee != null ? src.Employee.EmployeeCode : string.Empty));

        CreateMap<ReturnRequest, ReturnRequestDto>()
            .ForMember(dest => dest.DeviceName, opt => opt.MapFrom(src => src.Device != null ? src.Device.Name : string.Empty))
            .ForMember(dest => dest.DeviceCode, opt => opt.MapFrom(src => src.Device != null ? src.Device.Code : string.Empty))
            .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee != null ? src.Employee.FullName : string.Empty));

        CreateMap<DeviceTransaction, DeviceTransactionDto>();
    }
}
