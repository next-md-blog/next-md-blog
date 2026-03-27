import { getBlogRobots } from '@next-md-blog/core/next';
import blogConfig from '../next-md-blog.config';

export default function robots() {
  return getBlogRobots(blogConfig);
}
