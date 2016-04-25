import babel from 'rollup-plugin-babel';

export default {
	entry: 'src/SimplePreloader.js',
	dest: 'dist/simple-preloader.js',
	format: 'cjs',
	plugins: [
		babel({
			exclude: 'node_modules/**'
		})
	]
};
