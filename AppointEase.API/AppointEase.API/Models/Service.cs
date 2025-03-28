using System;

namespace AppointEase.API.Models
{
    public class Service
    {
        public int Id { get; set; }
        public int ProviderId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public ServiceCategory Category { get; set; }
        public int Duration { get; set; }  // Duration in minutes
        public int Price { get; set; }     // Price in cents
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
