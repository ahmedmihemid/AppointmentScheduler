using AppointEase.API.Models;
using System;

namespace AppointEase.API.DTOs
{
    public class AppointmentCreateDTO
    {
        public int CustomerId { get; set; }
        public int ProviderId { get; set; }
        public int ServiceId { get; set; }
        public int? EmployeeId { get; set; }
        public DateTime Date { get; set; }
    }

    public class AppointmentUpdateDTO
    {
        public AppointmentStatus Status { get; set; }
    }

    public class AppointmentDTO
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public int ProviderId { get; set; }
        public int ServiceId { get; set; }
        public int? EmployeeId { get; set; }
        public DateTime Date { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string ProviderName { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public string ServiceCategory { get; set; } = string.Empty;
        public int Duration { get; set; }
        public string Status { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
    }
}
