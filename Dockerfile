# Use the official .NET 8 SDK as a build environment
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy the solution and project files
COPY Nexus.Backend/*.slnx ./Nexus.Backend/
COPY Nexus.Backend/Nexus.API/*.csproj ./Nexus.Backend/Nexus.API/
COPY Nexus.Backend/Nexus.Application/*.csproj ./Nexus.Backend/Nexus.Application/
COPY Nexus.Backend/Nexus.Domain/*.csproj ./Nexus.Backend/Nexus.Domain/
COPY Nexus.Backend/Nexus.Infrastructure/*.csproj ./Nexus.Backend/Nexus.Infrastructure/

# Restore dependencies
RUN dotnet restore Nexus.Backend/Nexus.API/Nexus.API.csproj

# Copy the remaining source code
COPY Nexus.Backend/ ./Nexus.Backend/

# Build and publish the application
WORKDIR /app/Nexus.Backend/Nexus.API
RUN dotnet publish -c Release -o /out

# Build the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /out .

# Expose port 80/8080 (Render uses PORT env variable)
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Nexus.API.dll"]
