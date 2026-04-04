Set-Location -Path "c:\Users\Dudekula arshad\OneDrive\Desktop\gig sheild\stitch\app"
$env:CI = "true"
npm config set interactive false
npm install --no-audit --no-fund > install.log 2>&1
Start-Process -NoNewWindow -FilePath "npm.cmd" -ArgumentList "run", "dev" -RedirectStandardOutput "dev.log" -RedirectStandardError "dev_err.log"
