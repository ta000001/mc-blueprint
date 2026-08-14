@echo off
rem MOD マスタから dict/form_dict/names_ja/blocktex を一方向反映 (STEP2)。
powershell -ExecutionPolicy Bypass -File "%~dp0sync-from-mod.ps1"
pause
