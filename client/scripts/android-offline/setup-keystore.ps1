$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "../..")
$Dir = Join-Path $Root "android-offline/keystore"
$Keystore = Join-Path $Dir "ui-app-release.keystore"

New-Item -ItemType Directory -Force -Path $Dir | Out-Null

if (Test-Path $Keystore) {
    Write-Host "证书已存在: $Keystore"
} else {
    keytool -genkeypair -v `
        -keystore $Keystore `
        -alias uiapp `
        -keyalg RSA -keysize 2048 -validity 10000 `
        -storepass uiapp123456 -keypass uiapp123456 `
        -dname "CN=ui-app, OU=Dev, O=Cancan, L=Local, ST=Local, C=CN"
    Write-Host "已生成: $Keystore"
}

Write-Host "`n请将以下 SHA1 填到 DCloud 开发者中心 → 应用 → 各平台信息 → Android 离线 Key："
keytool -list -v -keystore $Keystore -storepass uiapp123456 | Select-String "SHA1:"

Write-Host "`n签名信息（写入 simpleDemo/build.gradle 时使用）："
Write-Host "  storeFile: android-offline/keystore/ui-app-release.keystore"
Write-Host "  keyAlias : uiapp"
Write-Host "  storePassword / keyPassword: uiapp123456"
