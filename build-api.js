import { spawnSync } from 'child_process';

const dotnetHome = '/Users/miniboyz/Coding/WMS/wms-core-api/obj/dotnet_home';
process.env.DOTNET_CLI_HOME = dotnetHome;
process.env.DOTNET_SKIP_FIRST_TIME_EXPERIENCE = '1';
process.env.DOTNET_CLI_TELEMETRY_OPTOUT = '1';
process.env.XDG_DATA_HOME = dotnetHome;

console.log('Spawning dotnet build --no-restore...');
const result = spawnSync('dotnet', ['build', '--no-restore'], {
  cwd: '/Users/miniboyz/Coding/WMS/wms-core-api',
  stdio: 'inherit',
  env: process.env
});

process.exit(result.status || 0);
