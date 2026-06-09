$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "../..")

$Manifest = Get-Content (Join-Path $Root "src/manifest.json") -Raw
$AppId = if ($Manifest -match '"appid"\s*:\s*"(__UNI__[^"]+)"') { $Matches[1] } else { throw "manifest.json 缺少 appid" }

$ResourceSrc = Join-Path $Root "unpackage/resources/$AppId"
if (-not (Test-Path $ResourceSrc)) {
    throw "未找到 $ResourceSrc`n请先在 HBuilderX 生成本地打包 App 资源"
}

$SdkRoot = Join-Path $Root "android-offline/HBuilder-Integrate-AS"
if (-not (Test-Path $SdkRoot)) {
    throw "未找到 $SdkRoot`n请下载离线 SDK 并解压 HBuilder-Integrate-AS 到 android-offline/"
}

$AppsDir = Join-Path $SdkRoot "simpleDemo/src/main/assets/apps"
$DataDir = Join-Path $SdkRoot "simpleDemo/src/main/assets/data"
New-Item -ItemType Directory -Force -Path $AppsDir | Out-Null

Get-ChildItem $AppsDir -Directory -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
Copy-Item -Path $ResourceSrc -Destination (Join-Path $AppsDir $AppId) -Recurse -Force

$DcloudControl = Join-Path $DataDir "dcloud_control.xml"
if (-not (Test-Path $DcloudControl)) { throw "缺少 $DcloudControl" }

$xml = Get-Content $DcloudControl -Raw
$xml = $xml -replace 'appid="__UNI__[^"]*"', "appid=`"$AppId`""
Set-Content -Path $DcloudControl -Value $xml -Encoding UTF8

Write-Host "已同步资源到: $AppsDir/$AppId"
Write-Host "已更新 dcloud_control.xml appid=$AppId"
