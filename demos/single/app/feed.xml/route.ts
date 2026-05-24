import { blog } from '../../next-md-blog.config';

export async function GET() {
  return blog.rssResponse();
}
