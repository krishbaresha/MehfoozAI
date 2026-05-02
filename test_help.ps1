# Help Command Tester for MehfoozAI
$message = "help"
$url = "http://localhost:8000/webhook/whatsapp"

$jsonBody = @{
    object = "whatsapp_business_account"
    entry = @(
        @{
            changes = @(
                @{
                    value = @{
                        messages = @(
                            @{
                                from = "923142291356"
                                type = "text"
                                text = @{ body = $message }
                            }
                        )
                    }
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "🚀 Sending 'help' command to backend..." -ForegroundColor Cyan
Invoke-RestMethod -Uri $url -Method Post -Body $jsonBody -ContentType "application/json"

Write-Host "`n✅ Check your backend terminal to see if the help message was triggered." -ForegroundColor Green
