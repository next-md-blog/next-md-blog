---
title: "Getting Started with next-md-blog"
date: "2024-01-20"
description: "Learn how to set up and use next-md-blog in your Next.js project"
author: "Jane Smith"
tags: ["tutorial", "guide"]
---

This guide will help you get started with the next-md-blog library.

## Installation

First, install the library in your Next.js project:

```bash
npm install @next-md-blog/core
```

## Initialization

Run the initialization command:

```bash
npx @next-md-blog/cli
```

This will:
- Create a `posts/` folder
- Set up the necessary routes
- Add an example blog post

## Writing Blog Posts

1. Create a new markdown file in the `posts/` folder
2. Add frontmatter at the top of the file
3. Write your content in markdown

Example:

```markdown
---
title: "My First Post"
date: "2024-01-15"
description: "A description of my post"
---

# My First Post

Your content here...
```

## Accessing Your Posts

- Individual post: `/blog/[slug]`
- All posts: `/blogs`

That's it! You're ready to start blogging.

