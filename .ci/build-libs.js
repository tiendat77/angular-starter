const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const angularJsonPath = path.resolve(__dirname, '../angular.json');

try {
  const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

  const libraries = Object.keys(angularJson.projects).filter(
    (projectName) => angularJson.projects[projectName].projectType === 'library'
  );

  if (libraries.length === 0) {
    console.log('No libraries found to build.');
    process.exit(0);
  }

  console.log(`Found ${libraries.length} libraries to build:`);
  libraries.forEach((lib) => console.log(`- ${lib}`));
  console.log('----------------------------------------');

  let hasError = false;

  for (const lib of libraries) {
    console.log(`\n🚀 Building ${lib}...`);

    const result = spawnSync('npx', ['ng', 'build', lib], {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
      shell: true,
    });

    if (result.status !== 0) {
      console.error(`\n❌ Failed to build ${lib}. Exiting.`);
      hasError = true;
      break;
    }

    console.log(`✅ Successfully built ${lib}.`);
  }

  if (hasError) {
    process.exit(1);
  } else {
    console.log('\n🎉 All libraries built successfully!');
  }
} catch (error) {
  console.error('Error reading angular.json or building libraries:', error);
  process.exit(1);
}
