import * as esbuild from 'esbuild';
import ncp from 'ncp';

const isDev = process.env.NODE_ENV === 'development';

const esbuildOptions = {
  entryPoints: ['./src/index.tsx'],
  bundle: true,
  outdir: 'dist/js',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
  },
  sourcemap: isDev,
  minify: !isDev,
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  target: 'esnext',
};

const build = async () => {
  await esbuild.build(esbuildOptions);

  ncp.ncp('./src/index.html', './dist/index.html', (err) => {
    if (err) {
      return console.error('Error copying index.html:', err);
    }

    console.log('index.html copied to dist');
  });
};

const serve = async () => {
  let ctx = await esbuild.context(esbuildOptions);

  let { host, port } = await ctx.serve({
    servedir: 'dist',
  });
  console.log(`server running on ${host}:${port}`);

  ncp.ncp('./src/index.html', './dist/index.html', (err) => {
    if (err) {
      return console.error('Error copying index.html:', err);
    }

    console.log('index.html copied to dist');
  });

  await ctx.watch();
  console.log('watching...');
}

if (isDev) {
  serve().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  build().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
