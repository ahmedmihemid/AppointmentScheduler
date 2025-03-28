using AppointEase.API.Models;

namespace AppointEase.API.DTOs
{
    public class ProviderCreateDTO
    {
        public int UserId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public ServiceCategory Category { get; set; }
        public string? Description { get; set; }
        public string? WorkingHours { get; set; }
    }

    public class ProviderUpdateDTO
    {
        public string CompanyName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public ServiceCategory Category { get; set; }
        public string? Description { get; set; }
        public string? WorkingHours { get; set; }
        public bool IsVerified { get; set; }
    }

    public class ProviderDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? WorkingHours { get; set; }
        public bool IsVerified { get; set; }
    }
}
