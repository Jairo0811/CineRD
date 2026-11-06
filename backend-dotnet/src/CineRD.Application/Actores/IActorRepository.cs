using CineRD.Domain.Actores;

namespace CineRD.Application.Actores;

public interface IActorRepository
{
    Task<IReadOnlyList<ActorConConteos>> ListarAsync(ActorListQuery query, CancellationToken cancellationToken);

    Task<Actor?> ObtenerPorIdAsync(int id, CancellationToken cancellationToken);
}
