const path          = require('path');
const gulp          = require('gulp');
const sass          = require('gulp-sass');
const nunjucks      = require('gulp-nunjucks');
const data          = require('gulp-data');
const jsonfile      = require('jsonfile');
const rename        = require('gulp-rename');
const autoprefixer  = require('gulp-autoprefixer');
const newer         = require('gulp-newer');
const bs            = require('browser-sync');
const webpack       = require('webpack-stream');
const named         = require('vinyl-named');

let mode = 'development'

gulp.task('recipes', done => {
	const siteData = jsonfile.readFileSync('./src/data.json');
	const recipes = siteData.recipes;
	const pages = [];

	for (let i = 0; i < recipes.length; i ++) {
		const recipe = recipes[i];

		if (recipe.id) {
			pages.push(done =>
				gulp.src('src/views/**/_recipe.njk')
					.pipe(nunjucks.compile(
						Object.assign({ root: "../..", recipeIndex: i }, siteData)
					))
					.pipe(rename({
						basename: recipe.id,
						extname: '.html'
					}))
					.pipe(gulp.dest('dist'))
			);
		}
	}

	if (pages.length > 0) gulp.series(...pages)();
	done();
});

gulp.task('views', gulp.parallel('recipes', done => {
	const siteData = jsonfile.readFileSync('src/data.json');

	return gulp.src(["src/views/**/*.njk", "!src/views/**/_*.njk"])
		.pipe(data(file => {
			const rootPath = path.join(__dirname, 'src/');

			let fileSpread = file.path.split(path.sep);

			fileSpread.splice(0, fileSpread.indexOf('views') + 1);
			fileSpread.pop();

			filePath = path.join(rootPath, ...fileSpread);
			let root = path.relative(filePath, rootPath);

			if (root === '') root = '.';

			return Object.assign({root: root}, siteData);
		}))
		.pipe(nunjucks.compile())
		.pipe(rename({ extname: '.html' }))
		.pipe(gulp.dest('dist'));
}));

gulp.task('styles', done =>
	gulp.src(['src/styles/**/*.scss', '!src/styles/**/_*.scss'])
		.pipe(sass({
			outputStyle: 'expanded'
		}).on('error', sass.logError))

		.pipe(autoprefixer({
			browsers: ['last 4 versions'],
			cascade: false
		}))
		
		.pipe(gulp.dest('dist/css'))
		.pipe(bs.stream())
);

gulp.task('scripts', done =>
	gulp.src('src/scripts/*.js')
		.pipe(named())
		.pipe(webpack({
			mode,
			module: {
				rules: [
					{
						test: /\.m?js$/,
						exclude: /(node_modules|bower_components)/,
						use: {
							loader: 'babel-loader',
							options: {
								presets: ['@babel/preset-env']
							}
						}
					}
				]
			}
		}))
		.pipe(gulp.dest('dist/scripts'))
);

gulp.task('media', done =>
	gulp.src('src/media/**')
		.pipe(newer('dist/media'))
		.pipe(gulp.dest('dist/media'))
		.pipe(bs.stream())
);

gulp.task('fonts', done =>
	gulp.src('src/fonts/**')
		.pipe(newer('dist/fonts'))
		.pipe(gulp.dest('dist/fonts'))
		.pipe(bs.stream())
);

gulp.task('data', done =>
	gulp.src('src/data.json')
		.pipe(gulp.dest('dist'))
);

gulp.task('dev', gulp.series('views', 'styles', 'scripts', 'fonts', 'media', 'data', () => {
	gulp.watch(['src/models/**/*.json', 'src/views/**/*.njk'], gulp.parallel('views'))
		.on('change', bs.reload);
	
	gulp.watch('src/scripts/**/*.js', gulp.parallel('scripts'))
		.on('change', bs.reload);
	
	gulp.watch('src/data.json', gulp.parallel('views', 'data'))
		.on('change', bs.reload);

	gulp.watch('src/media/**', gulp.parallel('media'));
	gulp.watch('src/fonts/**', gulp.parallel('fonts'));
	gulp.watch(['src/styles/**/*.scss', 'src/styles/**/*.css'], gulp.parallel('styles'));
	
	bs.init({
		server: {
			baseDir: './dist',
			port: 3030
		}
	});
}));

gulp.task('build', gulp.parallel(done => {
	mode = 'production';
	done();
}, 'views', 'styles', 'scripts', 'media', 'fonts', 'data'));