using AppointEase.API.Models;

namespace AppointEase.API.DTOs
{
    public class ServiceCreateDTO
    {
        public int ProviderId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public ServiceCategory Category { get; set; }
        public int Duration { get; set; }
        public int Price { get; set; }
    }

    public class ServiceUpdateDTO
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public ServiceCategory Category { get; set; }
        public int Duration { get; set; }
        public int Price { get; set; }
        public bool IsActive { get; set; }
    }

    public class ServiceDTO
    {
        public int Id { get; set; }
        public int ProviderId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public int Duration { get; set; }
        public int Price { get; set; }
        public bool IsActive { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
    }
}
