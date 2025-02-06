const Image = require("@11ty/eleventy-img");
const browserslist = require('browserslist');
const lightningcss = require('lightningcss');
const htmlmin = require('html-minifier');
const packageJson = require('./package.json');

async function imageShortcode(alt, primarySrc, secondarySrc, primaryMedia, secondaryMedia) {
    const formats = ["avif", "webp", "png", "jpeg", "svg"];
    const widths = [400, 800, 1200];

    // Common options for both images.
    const imageOptions = {
        widths,
        formats,
        urlPath: "/images/",
        outputDir: "./dist/images/",
        svgShortCircuit: true,
    };

    // If a secondary image is provided, both media queries must be specified.
    if (secondarySrc && (!primaryMedia || !secondaryMedia)) {
        throw new Error("You must provide media queries for both primary and secondary images.");
    }

    // Generate metadata for the primary image.
    const primaryMetadata = await Image(primarySrc, imageOptions);
    // Generate metadata for the secondary image if provided (for art direction).
    const secondaryMetadata = secondarySrc ? await Image(secondarySrc, imageOptions) : null;

    // Helper function to pick a fallback image from metadata.
    const getFallback = (metadata) => {
        return metadata.jpeg
            ? metadata.jpeg[metadata.jpeg.length - 1]
            : Object.values(metadata)[0][0];
    };

    // Pre-calculate fallback objects.
    const fallbackPrimary = getFallback(primaryMetadata);
    const fallbackSecondary = secondaryMetadata ? getFallback(secondaryMetadata) : null;

    // Compute a sizes attribute string for the sources.
    // When using art direction, we want the browser to choose:
    //   - the secondary candidate if the viewport matches secondaryMedia,
    //   - otherwise, the primary candidate.
    const fallbackSizes = secondaryMetadata
        ? `${secondaryMedia} ${fallbackSecondary.width}px, ${fallbackPrimary.width}px`
        : "100vw";

    // Helper to generate <source> tags from metadata, now with a sizes attribute.
    const renderSources = (metadata, media, sizes) =>
        Object.values(metadata)
            .map((format) => {
                const mediaAttr = media ? ` media="${media}"` : "";
                const sizesAttr = ` sizes="${sizes}"`;
                const srcset = format.map(entry => `${entry.url} ${entry.width}w`).join(", ");
                return `<source type="${format[0].sourceType}"${mediaAttr}${sizesAttr} srcset="${srcset}">`;
            })
            .join("\n");

    // Build the picture sources.
    let sources = renderSources(primaryMetadata, primaryMedia, fallbackSizes);
    if (secondaryMetadata) {
        sources += "\n" + renderSources(secondaryMetadata, secondaryMedia, fallbackSizes);
    }

    // Build the fallback <img> tag.
    let fallbackImgTag;
    if (secondaryMetadata) {
        // Use a responsive fallback: include both images in srcset with the computed sizes.
        fallbackImgTag = `<img loading="lazy" decoding="async" alt="${alt}"
       src="${fallbackPrimary.url}"
       srcset="${fallbackSecondary.url} ${fallbackSecondary.width}w, ${fallbackPrimary.url} ${fallbackPrimary.width}w"
       sizes="${fallbackSizes}">`;
    } else {
        fallbackImgTag = `<img loading="lazy" decoding="async" alt="${alt}" 
       src="${fallbackPrimary.url}" 
       width="${fallbackPrimary.width}" 
       height="${fallbackPrimary.height}">`;
    }

    return `<picture>
  ${sources}
  ${fallbackImgTag}
</picture>`;
}

module.exports = (eleventyConfig) => {
    const isBuild = process.env.ELEVENTY_RUN_MODE === 'build';

    // Assets
    eleventyConfig.addPassthroughCopy({ public: '/' });

    // CSS
    const targets = lightningcss.browserslistToTargets(
        browserslist(packageJson.browserslist),
    );

    eleventyConfig.addTemplateFormats('css');

    eleventyConfig.addExtension('css', {
        compile(_, inputPath) {
            if (inputPath !== './src/css/main.css') return;

            return function () {
                const { code } = lightningcss.bundle({
                    drafts: {
                        customMedia: true,
                    },
                    filename: inputPath,
                    minify: isBuild,
                    targets,
                });
                return code;
            };
        },
        outputFileExtension: 'css',
    });

    // IMAGES
    eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

    // HTML
    eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
        if (isBuild && outputPath && outputPath.endsWith(".html")) {
            let minified = htmlmin.minify(content, {
                collapseWhitespace: true,
                // minifyCSS: true,
                // minifyJS: true,
                removeComments: true,
                useShortDoctype: true,
            });
            return minified;
        }
        return content;
    });

    // FILTERS
    eleventyConfig.addFilter('formatDateISO', function (date) {
        return new Intl.DateTimeFormat('fr-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'UTC',
        }).format(new Date(date));
    });

    return {
        dir: {
            input: "src",
            output: "dist",
        },
        htmlTemplateEngine: 'njk',
        markdownTemplateEngine: 'njk',
    };
};
