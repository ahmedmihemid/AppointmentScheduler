namespace AppointEase.API.DTOs
{
    public class EmployeeCreateDTO
    {
        public int ProviderId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Position { get; set; }
        public string Department { get; set; } = string.Empty;
        public string? WorkingHours { get; set; }
    }

    public class EmployeeUpdateDTO
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Position { get; set; }
        public string Department { get; set; } = string.Empty;
        public string? WorkingHours { get; set; }
        public bool IsActive { get; set; }
    }

    public class EmployeeDTO
    {
        public int Id { get; set; }
        public int ProviderId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Position { get; set; }
        public string Department { get; set; } = string.Empty;
        public string? WorkingHours { get; set; }
        public bool IsActive { get; set; }
    }
}
