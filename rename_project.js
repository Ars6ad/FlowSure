const fs = require('fs');
const path = require('path');

const targetDirs = [
  'c:\\Users\\Dudekula arshad\\OneDrive\\Desktop\\gig sheild\\stitch\\app\\src',
  'c:\\Users\\Dudekula arshad\\OneDrive\\Desktop\\gig sheild\\stitch\\app'
];
const filesToProcess = [
  'c:\\Users\\Dudekula arshad\\OneDrive\\Desktop\\gig sheild\\stitch\\README.md',
  'c:\\Users\\Dudekula arshad\\OneDrive\\Desktop\\gig sheild\\stitch\\app\\package.json',
  'c:\\Users\\Dudekula arshad\\OneDrive\\Desktop\\gig sheild\\stitch\\app\\index.html',
  // Note: package-lock.json will be regenerated or handled by npm install if needed, but we'll include it safely
  'c:\\Users\\Dudekula arshad\\OneDrive\\Desktop\\gig sheild\\stitch\\app\\package-lock.json'
];

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        getFiles(filePath, fileList);
      }
    } else {
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

targetDirs.forEach(dir => {
    if(dir === 'c:\\Users\\Dudekula arshad\\OneDrive\\Desktop\\gig sheild\\stitch\\app\\src') {
        getFiles(dir, filesToProcess);
    }
});

let replacements = 0;
filesToProcess.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace names
    content = content.replace(/GigShield/g, 'FlowSure');
    content = content.replace(/gigshield/g, 'flowsure');
    // For package.json name field
    content = content.replace(/gigshield-app/g, 'flowsure-app');

    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated: ${file}`);
      replacements++;
    }
  }
});

console.log(`Done! Updated ${replacements} files.`);
