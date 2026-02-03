const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imageDir = path.join(__dirname, '../public/images');

console.log('Starting image optimization...');

fs.readdir(imageDir, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        process.exit(1);
    }

    files.forEach(file => {
        if (path.extname(file).toLowerCase() === '.png') {
            const inputFile = path.join(imageDir, file);
            const outputFile = path.join(imageDir, path.basename(file, '.png') + '.webp');

            if (!fs.existsSync(outputFile)) {
                sharp(inputFile)
                    .webp({ quality: 80 })
                    .toFile(outputFile)
                    .then(info => console.log(`Optimized: ${file} -> ${path.basename(outputFile)}`))
                    .catch(err => console.error(`Error optimizing ${file}:`, err));
            } else {
                console.log(`Skipping ${file} (WebP already exists)`);
            }
        }
    });
});
