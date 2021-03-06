<div align="center">
    <img src="https://raw.githubusercontent.com/IrishBruse/CSharp-Utilities/main/assets/128.png">
    <h1>C# Utilities</h1>
</div>

This extension adds utilitity commands and features that I found I needed when writting C# code in vscode.

- [Commands](#commands)
  - [Generate Assets from .sln](#generate-assets-from-sln)
  - [Add csproj to solution](#add-csproj-to-solution)
- [Features](#features)
  - [New File Template](#new-file-template)
  - [Auto Generate Assets](#auto-generate-assets)

# Commands

## Generate Assets from .sln
It generates all launch.json and task.json for all the projects inside the solution file.
Rerun this if you update the sln it will only add the newly added projects.
If you dont have a sln file you can do `dotnet new sln`.
You can add them from the command line using `dotnet sln add path/to/*.csproj`.
It wont replace any custom tasks or launch configs you have.

We now have config option to config the auto generated config files
- `Launch Config: Console`
- `Launch Config: Internal Console Options`
- `Task Config: Problem Matcher`

## Add csproj to solution
Right click on `.csproj` to add it to the solution.
Runs `dotnet sln add path/to/*.csproj` under the hood.
One done you can run the [Generate Assets from .sln](#generate-assets-from-sln)

# Features

## New File Template
When creating a new .cs file it automatically generates with a template containing a file scoped
namespace and a selection of `class`, `struct`, `interface`, `enum`, `abstract class`, `interface`

## Auto Generate Assets
When a folder or workspace is loaded if the config `csharp-utilities.autoGenerateAssets`
is enabled in the settings then it will run [Generate Assets from .sln](#generate-assets-from-.sln) automatically
