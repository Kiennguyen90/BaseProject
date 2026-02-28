using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Guids;
using BaseProject.MachineTools.Devices;
using BaseProject.MachineTools.Enums;

namespace BaseProject.MachineTools.Data;

public class MachineToolsDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IGuidGenerator _guidGenerator;

    public MachineToolsDataSeedContributor(
        IDeviceRepository deviceRepository,
        IGuidGenerator guidGenerator)
    {
        _deviceRepository = deviceRepository;
        _guidGenerator = guidGenerator;
    }

    public async Task SeedAsync(DataSeedContext context)
    {
        if (await _deviceRepository.GetCountAsync() > 0)
            return;

        // Seed sample categories and devices
        // This will be expanded when needed
    }
}
