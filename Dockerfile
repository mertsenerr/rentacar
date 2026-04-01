FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["backend/CorporateElite.API.csproj", "backend/"]
RUN dotnet restore "backend/CorporateElite.API.csproj"
COPY . .
WORKDIR "/src/backend"
RUN dotnet build "CorporateElite.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CorporateElite.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CorporateElite.API.dll"]
