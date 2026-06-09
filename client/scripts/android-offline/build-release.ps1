$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "../..")
$SdkRoot = Join-Path $Root "android-offline/HBuilder-Integrate-AS"

if (-not (Test-Path $SdkRoot)) {
    throw "未找到离线 SDK 工程: $SdkRoot"
}

$Keystore = Join-Path $Root "android-offline/keystore/ui-app-release.keystore"
if (-not (Test-Path $Keystore)) {
    throw "未找到签名证书，先运行 setup-keystore.ps1"
}

Push-Location $SdkRoot
try {
    if (Test-Path ".\gradlew.bat") {
        .\gradlew.bat :simpleDemo:assembleRelease
    } else {
        gradle :simpleDemo:assembleRelease
    }
} finally {
    Pop-Location
}

$Apk = Get-ChildItem -Path (Join-Path $SdkRoot "simpleDemo/build/outputs/apk") -Filter "*-release.apk" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
if ($Apk) {
    $OutDir = Join-Path $Root "android-offline/output"
    New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
    $Dest = Join-Path $OutDir $Apk.Name
    Copy-Item $Apk.FullName $Dest -Force
    Write-Host "APK 已输出: $Dest"
} else {
    Write-Host "构建完成，请在 simpleDemo/build/outputs/apk 下查找 APK"
}
