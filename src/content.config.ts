import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			tags: z.array(z.string()).optional(),
			categories: z.array(z.string()).optional(),
			legacySlug: z.string().min(1, 'legacySlug must not be empty'),
			legacyPath: z.string().min(1, 'legacyPath must not be empty'),
			heroImage: image().optional(),
		}),
});

export const collections = { blog };
