---
title: "Welcome to My Blog"
date: "2024-01-15"
description: "This is a welcome post to get you started with next-md-blog"
author: "John Doe"
tags: ["welcome", "getting-started"]
---

This is your first blog post! You can edit this file in the `posts` folder.

## Getting Started

Write your blog posts in markdown format and save them in the `posts` folder. Each markdown file will automatically become a blog post accessible at `/blog/[filename]`.

## Features

- **Markdown Support**: Write in standard markdown
- **Frontmatter**: Add metadata using YAML frontmatter
- **Easy Integration**: Works seamlessly with Next.js
- **Type Safe**: Full TypeScript support

## Code Example

Here's a code example:

```typescript
import { getBlogPost } from '@next-md-blog/core';

const post = await getBlogPost('welcome');
```

Enjoy writing your blog posts!

