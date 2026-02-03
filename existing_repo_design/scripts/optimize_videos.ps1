$videoDir = "public\videos"
$imageDir = "public\images"

# Ensure ffmpeg is available
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Error "ffmpeg is not installed. Please install it to optimize videos."
    exit 1
}

# Process source_n8n_workflow.mp4 specifically
$n8nSource = Join-Path $videoDir "source_n8n_workflow.mp4"
if (Test-Path $n8nSource) {
    Write-Host "Processing automation hero video..."
    
    # MP4 Output
    $n8nMp4 = Join-Path $videoDir "video_automation_hero_n8n.mp4"
    if (-not (Test-Path $n8nMp4)) {
        ffmpeg -y -i $n8nSource -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k $n8nMp4
    }

    # WebM Output
    $n8nWebm = Join-Path $videoDir "video_automation_hero_n8n.webm"
    if (-not (Test-Path $n8nWebm)) {
        ffmpeg -y -i $n8nSource -c:v libvpx-vp9 -b:v 0 -crf 30 -c:a libopus $n8nWebm
    }

    # Poster Image
    $n8nPoster = Join-Path $imageDir "poster_automation_hero.webp"
    if (-not (Test-Path $n8nPoster)) {
        ffmpeg -y -i $n8nSource -ss 00:00:00.500 -vframes 1 $n8nPoster
    }
}

# Generic optimization for other MP4s
Get-ChildItem $videoDir -Filter *.mp4 | ForEach-Object {
    $input = $_.FullName
    if ($_.Name -ne "source_n8n_workflow.mp4" -and $_.Name -notlike "video_automation_hero_n8n.mp4") {
        $outputMp4 = Join-Path $videoDir ("optimized_" + $_.Name)
        $outputWebm = Join-Path $videoDir ($_.BaseName + ".webm")
        
        # Only process if not already optimized
        if (-not (Test-Path $outputMp4)) {
            Write-Host "Optimizing $($_.Name)..."
            ffmpeg -y -i $input -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k $outputMp4
        }
        
        if (-not (Test-Path $outputWebm)) {
             ffmpeg -y -i $input -c:v libvpx-vp9 -b:v 0 -crf 30 -c:a libopus $outputWebm
        }
    }
}
