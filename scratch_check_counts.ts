import { db } from './src/db/index';
import { collections, posts, products, media, orders, users } from './src/db/schema';

async function main() {
  const c = await db.select().from(collections);
  const po = await db.select().from(posts);
  const pr = await db.select().from(products);
  const m = await db.select().from(media);
  const o = await db.select().from(orders);
  const u = await db.select().from(users);

  console.log({
    collectionsCount: c.length,
    postsCount: po.length,
    productsCount: pr.length,
    mediaCount: m.length,
    ordersCount: o.length,
    usersCount: u.length
  });

  if (c.length > 0) console.log('Sample collection:', c[0].title);
  if (po.length > 0) console.log('Sample post:', po[0].title);
  if (pr.length > 0) console.log('Sample product:', pr[0].title);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
