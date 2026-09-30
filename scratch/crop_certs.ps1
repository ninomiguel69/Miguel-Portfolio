Add-Type -AssemblyName System.Drawing

$certs = @(
    @{
        In = "C:\Users\Miguel\.gemini\antigravity-ide\brain\b30bb945-99b9-480a-a056-c192f342bf4e\sololearn_cc_4o2cyfbd_1789812115968.png"
        Out = "d:\Portfolio Website\assets\certificates\cert-html.png"
    },
    @{
        In = "C:\Users\Miguel\.gemini\antigravity-ide\brain\b30bb945-99b9-480a-a056-c192f342bf4e\sololearn_cc_olcvfe6t_1789812299615.png"
        Out = "d:\Portfolio Website\assets\certificates\cert-css.png"
    },
    @{
        In = "C:\Users\Miguel\.gemini\antigravity-ide\brain\b30bb945-99b9-480a-a056-c192f342bf4e\sololearn_cc_k9iojpor_1789812337583.png"
        Out = "d:\Portfolio Website\assets\certificates\cert-js.png"
    }
)

if (!(Test-Path "d:\Portfolio Website\assets\certificates")) {
    New-Item -ItemType Directory -Path "d:\Portfolio Website\assets\certificates" -Force | Out-Null
}

foreach ($c in $certs) {
    $src = [System.Drawing.Bitmap]::FromFile($c.In)
    
    # Find the bounding box of the certificate card (near white background, e.g. R>235, G>235, B>235)
    # The certificate is centered in the viewport
    $rect = New-Object System.Drawing.Rectangle(350, 180, 666, 461)
    
    $target = New-Object System.Drawing.Bitmap($rect.Width, $rect.Height)
    $g = [System.Drawing.Graphics]::FromImage($target)
    $g.DrawImage($src, 0, 0, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $src.Dispose()
    
    $target.Save($c.Out, [System.Drawing.Imaging.ImageFormat]::Png)
    $target.Dispose()
    Write-Host "Saved $($c.Out)"
}
