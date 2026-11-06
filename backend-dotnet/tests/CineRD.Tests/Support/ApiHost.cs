using CineRD.API;
using Microsoft.AspNetCore.Builder;
using CineRD.Application.Abstractions;
using CineRD.Application.Actores;
using CineRD.Application.Peliculas;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace CineRD.Tests.Support;

/// <summary>Levanta la API real en memoria de proceso (Kestrel en puerto efímero) con dependencias falsas.</summary>
public sealed class ApiHost : IAsyncDisposable
{
    private readonly WebApplication _app;
    public HttpClient Client { get; }

    private ApiHost(WebApplication app)
    {
        _app = app;
        Client = new HttpClient { BaseAddress = new Uri(app.Urls.First()) };
    }

    public static async Task<ApiHost> StartAsync(
        IActorRepository repositorio, IDatabaseReadiness readiness, string environment = "Development", params string[] argumentos)
    {
        var app = ApiApplication.Create(
            ["--urls=http://127.0.0.1:0", $"--environment={environment}", .. argumentos],
            servicios =>
            {
                servicios.RemoveAll<IActorRepository>();
                servicios.RemoveAll<IDatabaseReadiness>();
                servicios.AddSingleton(repositorio);
                servicios.AddSingleton(readiness);
                servicios.AddScoped<ActorService>();
            });
        await app.StartAsync();
        return new ApiHost(app);
    }

    public static async Task<ApiHost> StartAsync(IPeliculaRepository peliculas)
    {
        var app = ApiApplication.Create(
            ["--urls=http://127.0.0.1:0", "--environment=Development"],
            servicios =>
            {
                servicios.RemoveAll<IPeliculaRepository>();
                servicios.AddSingleton(peliculas);
                servicios.AddScoped<PeliculaService>();
            });
        await app.StartAsync();
        return new ApiHost(app);
    }

    public async ValueTask DisposeAsync()
    {
        Client.Dispose();
        await _app.StopAsync();
        await _app.DisposeAsync();
    }
}
