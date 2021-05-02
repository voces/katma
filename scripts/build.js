import esbuild from "esbuild";

const watching = process.argv.includes("--watch");

esbuild
	.build({
		entryPoints: ["src/index.ts"],
		bundle: true,
		keepNames: true,
		sourcemap: true,
		format: "esm",
		outfile: "public/index.js",
		watch: watching && {
			onRebuild(error, result) {
				if (error) {
					console.error(error);
					return;
				}
				result.warnings.forEach((warning) => console.warn(warning));
				console.log("src/index.ts built");
			},
		},
	})
	.then(() => console.log("src/index.ts built"));

esbuild
	.build({
		entryPoints: ["src/server.ts"],
		bundle: true,
		keepNames: true,
		sourcemap: true,
		format: "cjs",
		outfile: "public/server.cjs",
		watch: watching && {
			onRebuild(error, result) {
				if (error) {
					console.error(error);
					return;
				}
				result.warnings.forEach((warning) => console.warn(warning));
				console.log("src/server.ts built");
			},
		},
	})
	.then(() => console.log("src/server.ts built"));
