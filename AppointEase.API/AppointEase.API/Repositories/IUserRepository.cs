using AppointEase.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppointEase.API.Repositories
{
    public interface IUserRepository
    {
        Task<User> GetByIdAsync(int id);
        Task<User> GetByUsernameAsync(string username);
        Task<IEnumerable<User>> GetAllAsync();
        Task<User> CreateAsync(User user);
        Task<User> UpdateAsync(int id, User user);
        Task<bool> DeleteAsync(int id);
        Task<bool> IsUsernameUniqueAsync(string username);
    }
}