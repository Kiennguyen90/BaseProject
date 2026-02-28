using BaseProject.MachineTools.Devices.Dtos;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace BaseProject.MachineTools.Devices;

public class DeviceCategoryAppService : ApplicationService, IDeviceCategoryAppService
{
    private readonly IRepository<DeviceCategory, Guid> _categoryRepository;

    public DeviceCategoryAppService(IRepository<DeviceCategory, Guid> categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<DeviceCategoryDto> GetAsync(Guid id)
    {
        var category = await _categoryRepository.GetAsync(id);
        return ObjectMapper.Map<DeviceCategory, DeviceCategoryDto>(category);
    }

    public async Task<ListResultDto<DeviceCategoryDto>> GetListAsync()
    {
        var categories = await _categoryRepository.GetListAsync();
        var dtos = ObjectMapper.Map<List<DeviceCategory>, List<DeviceCategoryDto>>(categories);
        return new ListResultDto<DeviceCategoryDto>(dtos);
    }

    public async Task<DeviceCategoryDto> CreateAsync(CreateDeviceCategoryDto input)
    {
        var category = new DeviceCategory(
            GuidGenerator.Create(),
            input.Name,
            input.Description
        );

        await _categoryRepository.InsertAsync(category);
        return ObjectMapper.Map<DeviceCategory, DeviceCategoryDto>(category);
    }

    public async Task<DeviceCategoryDto> UpdateAsync(Guid id, UpdateDeviceCategoryDto input)
    {
        var category = await _categoryRepository.GetAsync(id);
        category.SetName(input.Name);
        category.Description = input.Description;
        category.IsActive = input.IsActive;

        await _categoryRepository.UpdateAsync(category);
        return ObjectMapper.Map<DeviceCategory, DeviceCategoryDto>(category);
    }

    public async Task DeleteAsync(Guid id)
    {
        await _categoryRepository.DeleteAsync(id);
    }
}
