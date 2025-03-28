using AppointEase.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppointEase.API.Repositories
{
    public interface IAppointmentRepository
    {
        Task<Appointment> GetByIdAsync(int id);
        Task<IEnumerable<Appointment>> GetAllAsync();
        Task<IEnumerable<Appointment>> GetByCustomerAsync(int customerId);
        Task<IEnumerable<Appointment>> GetByProviderAsync(int providerId);
        Task<IEnumerable<Appointment>> GetByEmployeeAsync(int employeeId);
        Task<IEnumerable<Appointment>> GetByStatusAsync(AppointmentStatus status);
        Task<Appointment> CreateAsync(Appointment appointment);
        Task<Appointment> UpdateStatusAsync(int id, AppointmentStatus status);
        Task<bool> DeleteAsync(int id);
    }
}