namespace AppointEase.API.Models
{
    public class Provider
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public ServiceCategory Category { get; set; }
        public string? Description { get; set; }
        public string? WorkingHours { get; set; } // JSON string of working hours
        public bool IsVerified { get; set; } = false;
    }
}
