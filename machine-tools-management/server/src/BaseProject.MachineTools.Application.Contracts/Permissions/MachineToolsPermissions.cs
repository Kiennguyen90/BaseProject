namespace BaseProject.MachineTools.Permissions;

public static class MachineToolsPermissions
{
    public const string GroupName = "MachineTools";

    public static class Devices
    {
        public const string Default = GroupName + ".Devices";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }

    public static class DeviceCategories
    {
        public const string Default = GroupName + ".DeviceCategories";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }

    public static class BorrowRequests
    {
        public const string Default = GroupName + ".BorrowRequests";
        public const string Create = Default + ".Create";
        public const string Approve = Default + ".Approve";
    }

    public static class ReturnRequests
    {
        public const string Default = GroupName + ".ReturnRequests";
        public const string Create = Default + ".Create";
        public const string Confirm = Default + ".Confirm";
    }

    public static class Transactions
    {
        public const string Default = GroupName + ".Transactions";
    }

    public static class Dashboard
    {
        public const string Default = GroupName + ".Dashboard";
    }
}
