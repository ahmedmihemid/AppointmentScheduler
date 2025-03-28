using AppointEase.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppointEase.API.Repositories
{
    public interface IServiceRepository
    {
        Task<Service> GetByIdAsync(int id);
        Task<IEnumerable<Service>> GetAllAsync();
        Task<IEnumerable<Service>> GetByProviderAsync(int providerId);
        Task<IEnumerable<Service>> GetByCategoryAsync(ServiceCategory category);
        Task<Service> CreateAsync(Service service);
        Task<Service> UpdateAsync(int id, Service service);
        Task<bool> DeleteAsync(int id);
    }
}