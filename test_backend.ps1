# Local Backend Tester for MehfoozAI (Meta API Simulator)
$message = "Assalam-o-alaikum, Saddar market me ek admi gandi baatein kar raha hai"
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
                                from = "923001234567"
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

Write-Host "🚀 Sending Meta-simulated report to backend..." -ForegroundColor Cyan
Invoke-RestMethod -Uri $url -Method Post -Body $jsonBody -ContentType "application/json"

Write-Host "`n✅ Success! AI pipeline should be running in the backend terminal." -ForegroundColor Green
Write-Host "Check http://localhost:8000/api/v1/dashboard/cases in a few seconds." -ForegroundColor Yellow
