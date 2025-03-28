using System;

namespace AppointEase.API.Models
{
    public class Appointment
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
        public ServiceCategory ServiceCategory { get; set; }
        public int Duration { get; set; }
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
