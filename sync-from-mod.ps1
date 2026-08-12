# dict.json / form_dict.json を MOD（単一ソース）から一方向コピーして反映する。
#
# ★厳守ルール：このアプリ側で dict / form_dict を編集しない。
#   更新は必ず MOD 側 data/master/block/*.json を直し（form_dict は ./gradlew runData で再生成）、
#   本スクリプトで一方向 sync（生成元 MOD → 生成物 mc-blueprint）する。
#   dict/form_dict の version を上げて同期ズレ検知に使うこと。
#
# 使い方: PowerShell で  ./sync-from-mod.ps1   （MOD 位置が違う場合は -ModRoot で指定）

param([string]$ModRoot = "C:\work\マイクラ\forge-1.21.8-58.0.0-mdk")

$src = Join-Path $ModRoot "data\master\block"
foreach ($f in @("dict.json", "form_dict.json")) {
    $from = Join-Path $src $f
    if (-not (Test-Path $from)) { Write-Error "not found: $from"; exit 1 }
    Copy-Item $from (Join-Path $PSScriptRoot $f) -Force
    Write-Host "synced $f  <-  $from"
}
Write-Host "done. アプリ(index.html)は起動時に ./dict.json を fetch します。version を確認してください。"
