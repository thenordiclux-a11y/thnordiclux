import HomePage from './HomePage';
import { getSiteCmsHome, getSiteBlogPosts } from './lib/cms-site';

export const revalidate = 120;

export default async function Home() {
  const [cmsHome, blogPosts] = await Promise.all([getSiteCmsHome(), getSiteBlogPosts()]);
  return <HomePage cmsHome={cmsHome} blogPosts={blogPosts} />;
}
