namespace AppointEase.API.Models
{
    public enum AppointmentStatus
    {
        Pending,
        Confirmed,
        Canceled,
        Completed
    }

    public enum ServiceCategory
    {
        Healthcare,
        Sports,
        PersonalCare
    }

    public enum UserRole
    {
        Customer,
        Provider,
        Admin
    }
}
