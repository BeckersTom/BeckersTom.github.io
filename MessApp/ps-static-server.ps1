param(
    [int]$Port = 8000,
    [string]$Root = (Get-Location).ProviderPath
)

$prefix = "http://localhost:$Port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "Serving static files from: $Root"
    Write-Host "Open http://localhost:$Port/MessApp/index.html"

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        try {
            $rawPath = $request.Url.AbsolutePath
            if ([string]::IsNullOrEmpty($rawPath) -or $rawPath -eq '/') {
                $rawPath = '/MessApp/index.html'
            }

            $relativePath = $rawPath.TrimStart('/') -replace '/','\\'
            $filePath = Join-Path -Path $Root -ChildPath $relativePath

            if (Test-Path $filePath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $types = @{
                    '.html' = 'text/html; charset=utf-8'
                    '.htm'  = 'text/html; charset=utf-8'
                    '.css'  = 'text/css'
                    '.js'   = 'application/javascript'
                    '.json' = 'application/json'
                    '.png'  = 'image/png'
                    '.jpg'  = 'image/jpeg'
                    '.jpeg' = 'image/jpeg'
                    '.svg'  = 'image/svg+xml'
                    '.ttf'  = 'font/ttf'
                    '.woff' = 'font/woff'
                    '.woff2'= 'font/woff2'
                    '.txt'  = 'text/plain'
                    '.xml'  = 'application/xml'
                }
                if ($types.ContainsKey($ext)) { $response.ContentType = $types[$ext] } else { $response.ContentType = 'application/octet-stream' }
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
            else {
                $response.StatusCode = 404
                $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rawPath")
                $response.ContentType = 'text/plain; charset=utf-8'
                $response.ContentLength64 = $msg.Length
                $response.OutputStream.Write($msg, 0, $msg.Length)
            }
        }
        catch {
            # ignore per-request errors
        }
        finally {
            $response.OutputStream.Close()
        }
    }
}
catch {
    Write-Error "Failed to start HTTP listener: $_"
}
finally {
    if ($listener -and $listener.IsListening) { $listener.Stop(); $listener.Close() }
}
