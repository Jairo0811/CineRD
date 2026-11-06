using System.Net;
using Microsoft.AspNetCore.Builder;
using System.Text.Json;
using CineRD.API;

namespace CineRD.Tests;

/// <summary>Se omite si no hay una base de pruebas: define CINERD_TEST_SQL_CONNECTION (cadena de SQL Server de PRUEBAS, solo lectura).</summary>
public sealed class FactRequiereSqlAttribute : FactAttribute
{
    public const string Variable = "CINERD_TEST_SQL_CONNECTION";

    public FactRequiereSqlAttribute()
    {
        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(Variable)))
        {
            Skip = $"Pendiente: requiere SQL Server de pruebas ({Variable}).";
        }
    }
}

public class SqlServerIntegrationTests
{
    private static async Task<(WebApplication app, HttpClient http)> IniciarAsync()
    {
        var app = ApiApplication.Create(
            [
                "--urls=http://127.0.0.1:0",
                $"--ConnectionStrings:CineRD={Environment.GetEnvironmentVariable(FactRequiereSqlAttribute.Variable)}",
            ]);
        await app.StartAsync();
        return (app, new HttpClient { BaseAddress = new Uri(app.Urls.First()) });
    }

    [FactRequiereSql]
    public async Task ReadyDevuelve200ConSqlServerReal()
    {
        var (app, http) = await IniciarAsync();
        try { Assert.Equal(HttpStatusCode.OK, (await http.GetAsync("/ready")).StatusCode); }
        finally { http.Dispose(); await app.StopAsync(); }
    }

    [FactRequiereSql]
    public async Task ListadoYDetalleDevuelvenDatosReales()
    {
        var (app, http) = await IniciarAsync();
        try
        {
            var lista = await http.GetAsync("/api/actores");
            Assert.Equal(HttpStatusCode.OK, lista.StatusCode);
            using var doc = JsonDocument.Parse(await lista.Content.ReadAsStringAsync());
            Assert.Equal(JsonValueKind.Array, doc.RootElement.ValueKind);

            if (doc.RootElement.GetArrayLength() > 0)
            {
                var id = doc.RootElement[0].GetProperty("Id").GetInt32();
                Assert.Equal(HttpStatusCode.OK, (await http.GetAsync($"/api/actores/{id}")).StatusCode);
            }
            Assert.Equal(HttpStatusCode.NotFound, (await http.GetAsync($"/api/actores/{int.MaxValue}")).StatusCode);
        }
        finally { http.Dispose(); await app.StopAsync(); }
    }
}
