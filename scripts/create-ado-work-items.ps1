param(
  [Parameter(Mandatory = $true)]
  [string]$Organization,

  [Parameter(Mandatory = $true)]
  [string]$Project,

  [Parameter(Mandatory = $true)]
  [string]$Pat,

  [string]$AreaPath = "",
  [string]$IterationPath = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function New-BasicAuthHeader {
  param([string]$Token)
  $base64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$Token"))
  return @{
    Authorization = "Basic $base64"
    "Content-Type" = "application/json-patch+json"
  }
}

function New-WorkItem {
  param(
    [hashtable]$Headers,
    [string]$OrganizationName,
    [string]$ProjectName,
    [string]$Type,
    [string]$Title,
    [string]$Description,
    [string]$ParentId,
    [string]$Area,
    [string]$Iteration
  )

  $ops = @(
    @{
      op = "add"
      path = "/fields/System.Title"
      value = $Title
    },
    @{
      op = "add"
      path = "/fields/System.Description"
      value = $Description
    }
  )

  if ($Area -ne "") {
    $ops += @{
      op = "add"
      path = "/fields/System.AreaPath"
      value = $Area
    }
  }

  if ($Iteration -ne "") {
    $ops += @{
      op = "add"
      path = "/fields/System.IterationPath"
      value = $Iteration
    }
  }

  if ($ParentId -ne "") {
    $ops += @{
      op = "add"
      path = "/relations/-"
      value = @{
        rel = "System.LinkTypes.Hierarchy-Reverse"
        url = "https://dev.azure.com/$OrganizationName/$ProjectName/_apis/wit/workItems/$ParentId"
      }
    }
  }

  $uri = "https://dev.azure.com/$OrganizationName/$ProjectName/_apis/wit/workitems/`$${Type}?api-version=7.1"
  $body = $ops | ConvertTo-Json -Depth 10
  return Invoke-RestMethod -Method Post -Uri $uri -Headers $Headers -Body $body
}

$headers = New-BasicAuthHeader -Token $Pat

Write-Host "Creating Epic..."
$epic = New-WorkItem `
  -Headers $headers `
  -OrganizationName $Organization `
  -ProjectName $Project `
  -Type "Epic" `
  -Title "Concurso Olympic Data Story" `
  -Description "Programa principal para la web narrativa de visualizacion de datos olimpicos." `
  -ParentId "" `
  -Area $AreaPath `
  -Iteration $IterationPath

$features = @(
  @{
    Title = "Cold War in Gold"
    Description = "Rivalidad geopolitica y medallero olimpico."
    Tasks = @(
      "Definir dataset y filtros historicos para Guerra Fria",
      "Construir visualizacion principal de medallas por bloque",
      "Redactar narrativa y anotaciones de contexto"
    )
  },
  @{
    Title = "El Atlas del Cuerpo Olimpico"
    Description = "Patrones fisicos por deporte, sexo y epoca."
    Tasks = @(
      "Modelar variables corporales y normalizacion de datos",
      "Implementar visualizacion comparativa por deporte",
      "Escribir conclusiones y caveats metodologicos"
    )
  },
  @{
    Title = "El Cementerio Olimpico"
    Description = "Historia de deportes eliminados del programa olimpico."
    Tasks = @(
      "Curar lista historica de deportes retirados",
      "Crear timeline de nacimiento y retirada de disciplinas",
      "Redactar explicacion historica de cambios de programa"
    )
  },
  @{
    Title = "10 Olimpiadas, Una Vida"
    Description = "Trayectorias de longevidad en atletas olimpicos."
    Tasks = @(
      "Seleccionar casos y criterios de inclusion de carrera larga",
      "Construir visualizacion de trayectorias por atleta",
      "Crear texto narrativo con hitos destacados"
    )
  }
)

Write-Host ("Created Epic #{0}: {1}" -f $epic.id, $epic.fields.'System.Title')

foreach ($featureData in $features) {
  Write-Host ("Creating Feature: {0}" -f $featureData.Title)
  $feature = New-WorkItem `
    -Headers $headers `
    -OrganizationName $Organization `
    -ProjectName $Project `
    -Type "Feature" `
    -Title $featureData.Title `
    -Description $featureData.Description `
    -ParentId $epic.id `
    -Area $AreaPath `
    -Iteration $IterationPath

  Write-Host ("  Created Feature #{0}" -f $feature.id)

  foreach ($taskTitle in $featureData.Tasks) {
    $task = New-WorkItem `
      -Headers $headers `
      -OrganizationName $Organization `
      -ProjectName $Project `
      -Type "Task" `
      -Title $taskTitle `
      -Description "Task generada automaticamente para el backlog inicial." `
      -ParentId $feature.id `
      -Area $AreaPath `
      -Iteration $IterationPath

    Write-Host ("    Created Task #{0}: {1}" -f $task.id, $task.fields.'System.Title')
  }
}

Write-Host "Done. Backlog base creado correctamente."
