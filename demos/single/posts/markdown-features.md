---
title: "Markdown Features Showcase"
date: "2024-01-25"
description: "A demonstration of all the markdown features supported by next-md-blog"
author:
  - name: "Jane Smith"
  - name: "John Doe"
tags: ["markdown", "features", "showcase"]
---

This post demonstrates all the markdown features supported by next-md-blog.

## Headings

You can use different heading levels:

# Heading 1
## Heading 2
### Heading 3
#### Heading 4

## Text Formatting

- **Bold text**
- *Italic text*
- ***Bold and italic***
- ~~Strikethrough~~
- `Inline code`

## Lists

### Unordered List

- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

### Ordered List

1. First item
2. Second item
3. Third item

## Links and Images

[Link to example.com](https://example.com)

You can include images in your markdown:

![Example Image](/example.jpg)

Or use external images:

![Vercel Avatar](https://avatar.vercel.sh/rauchg)

## Code Blocks

Here's a JavaScript example:

```javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
```

Here's a TypeScript example:

```typescript
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: 'John',
  age: 30
};
```

## Blockquotes

> This is a blockquote.
> It can span multiple lines.
>
> And include multiple paragraphs.

## Tables

| Feature | Supported | Notes |
|---------|-----------|-------|
| Headings | ✅ | All 6 levels |
| Lists | ✅ | Ordered and unordered |
| Code | ✅ | Inline and blocks |
| Tables | ✅ | GitHub Flavored Markdown |

## Horizontal Rule

---

## Task Lists (GitHub Flavored Markdown)

- [x] Completed task
- [ ] Incomplete task
- [x] Another completed task

## Emoji

:smile: :rocket: :heart:

Enjoy exploring all these markdown features!

