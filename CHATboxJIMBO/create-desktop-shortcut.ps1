# PowerShell script do tworzenia skrótu na pulpicie
# Użycie: .\create-desktop-shortcut.ps1

$appPath = "$env:LOCALAPPDATA\Programs\JIMBO AI Chat\JIMBO AI Chat.exe"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = "$desktopPath\JIMBO AI Chat.lnk"

# Sprawdź czy aplikacja jest zainstalowana
if (Test-Path $appPath) {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = $appPath
    $Shortcut.WorkingDirectory = Split-Path $appPath
    $Shortcut.Description = "JIMBO AI Chat - Lokalna aplikacja z AI"
    $Shortcut.IconLocation = $appPath
    $Shortcut.Save()
    
    Write-Host "✅ Skrót utworzony na pulpicie: $shortcutPath" -ForegroundColor Green
}
else {
    # Alternatywa: portable exe z release/
    $portableExe = "M:\CHATboxJIMBO\release\JIMBO AI Chat 2.0.0.exe"
    
    if (Test-Path $portableExe) {
        $WshShell = New-Object -ComObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut($shortcutPath)
        $Shortcut.TargetPath = $portableExe
        $Shortcut.WorkingDirectory = "M:\CHATboxJIMBO\release"
        $Shortcut.Description = "JIMBO AI Chat - Lokalna aplikacja z AI (Portable)"
        $Shortcut.IconLocation = $portableExe
        $Shortcut.Save()
        
        Write-Host "✅ Skrót utworzony (portable): $shortcutPath" -ForegroundColor Green
    }
    else {
        # Fallback: uruchom z rozwijanego folderu
        $unpackedExe = "M:\CHATboxJIMBO\release\win-unpacked\JIMBO AI Chat.exe"
        
        if (Test-Path $unpackedExe) {
            $WshShell = New-Object -ComObject WScript.Shell
            $Shortcut = $WshShell.CreateShortcut($shortcutPath)
            $Shortcut.TargetPath = $unpackedExe
            $Shortcut.WorkingDirectory = "M:\CHATboxJIMBO\release\win-unpacked"
            $Shortcut.Description = "JIMBO AI Chat - Lokalna aplikacja z AI (Development)"
            $Shortcut.IconLocation = $unpackedExe
            $Shortcut.Save()
            
            Write-Host "✅ Skrót utworzony (unpacked): $shortcutPath" -ForegroundColor Green
        }
        else {
            Write-Host "❌ Nie znaleziono aplikacji. Najpierw uruchom: npm run dist" -ForegroundColor Red
            Write-Host "Szukano w:" -ForegroundColor Yellow
            Write-Host "  1. $appPath" -ForegroundColor Yellow
            Write-Host "  2. $portableExe" -ForegroundColor Yellow
            Write-Host "  3. $unpackedExe" -ForegroundColor Yellow
        }
    }
}
