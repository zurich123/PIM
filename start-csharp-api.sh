#!/bin/bash
cd csharp-api
export ASPNETCORE_ENVIRONMENT=Development
export ASPNETCORE_URLS="http://0.0.0.0:6000"
dotnet run