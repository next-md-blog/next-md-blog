import { getRobots } from '@next-md-blog/core/next';
import { site } from '../next-md-blog.config';

export default function robots() {
  return getRobots(site);
}
