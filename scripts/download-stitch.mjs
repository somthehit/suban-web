import fs from "fs";
import path from "path";

const screens = [
  {
    id: "e261f2f1c4c440c4a4edc9be44914134",
    folder: "stitch/screen-1-home",
    title: "SUBAN — Wildlife Photography Home & Cinematic Showcase",
    imageUrl: "https://lh3.googleusercontent.com/aida/AEtjO1WSj0QAtWptGCjxMitYF98_nUqaxhYLcuCsXw5Yqp4lttFVxwZP68VYH4q5y3dGIAmLq9iuiyNL4APFeJOlPO6aA5Z5nyMhw5VbjIWke6ZuwpqyX9JPp-eDPBZcFwLAsEzhCLmHJjEx0z41uwO-LrO9AS21ABqjrP7NTwYG8BfK2he2RwSnd3ur3AmDqErF7r0QCcPI6xtrFWuCj7H9DoJIP2y6rihWLgueFF-Lf6B7MQ",
    htmlUrl: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJyEgxzdGl0Y2hfZmlsZXMaYgosc3RpdGNoX2h0bWxfMDAwNjVkMjEyZGZkZDk0MjA3YzRlNDAyMTYxNGEwZTkSCxIHELG0p6KaCBgBkgEkCgpwcm9qZWN0X2lkEhZCFDEyNTE4MzI4OTg3MDc5MTMyNzk1&filename=&opi=89354086",
  },
  {
    id: "5be4b1677f5f4de9bcd49a9590d1b6e1",
    folder: "stitch/screen-2-collections",
    title: "Curated Collections & Expedition Portfolios",
    imageUrl: "https://lh3.googleusercontent.com/aida/AEtjO1VHHAtM7cpZMWrJ4YJWIlVuHuViEvytpwc7xmvAB5Qa4cxdiaQRa5UlAPiJG29TzYKr3ZWwlf6__ZDfJq08bov6mVOeQLPRXXtxKktDJW3wWXxV6aJqTOA4dl98HqnGYTmhBjgO1ig1PuXgXTyT_1P7nxj8BmsRbpS980PQWt0W1A4e_UvlNLzqtHi2lDAKZfknf8sIWVAndiJ4NbwyfvzI_nwRie2xzLhLGWa-Hh3QCQ",
    htmlUrl: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJyEgxzdGl0Y2hfZmlsZXMaYgosc3RpdGNoX2h0bWxfMDAwNjVkMjEyNjYxYjg4ZTA3YzRjZjVhYmYyNmMyY2ISCxIHELG0p6KaCBgBkgEkCgpwcm9qZWN0X2lkEhZCFDEyNTE4MzI4OTg3MDc5MTMyNzk1&filename=&opi=89354086",
  },
  {
    id: "cb581b0d09754ea6b6084192fb89adc5",
    folder: "stitch/screen-3-photo-detail",
    title: "Photo Detail & Licensing Pricing Tier Page",
    imageUrl: "https://lh3.googleusercontent.com/aida/AEtjO1XznbW37h5JgXJLOlY0CQotEWHZ_Lnvas8nrpvcqQ3tQu3IQK0Mgc9w8nsn_Pq1QNMSIbjfl6CQFAIcigM85NlnEsE7T-BJnNqEkCxcCr_lymfLvN0rhWuohKE-BwIoWv6CkReeAdJm7zwj16ZfCwXhJUp7Xv95qQcB8DPmaS9t-alahn6rHuxYlk3P7ph2QTC6d4_rhBMgpiHTUeuqnX3cko2cJ-BsncBTsOgBOmgH",
    htmlUrl: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJyEgxzdGl0Y2hfZmlsZXMaYgosc3RpdGNoX2h0bWxfMDAwNjVkMjEyZTk4Y2JkNTA3YzRlNDAyMTYxNGEwZTkSCxIHELG0p6KaCBgBkgEkCgpwcm9qZWN0X2lkEhZCFDEyNTE4MzI4OTg3MDc5MTMyNzk1&filename=&opi=89354086",
  },
  {
    id: "e4d2a7a9e1384fb98eba45f478b6c5b0",
    folder: "stitch/screen-4-checkout",
    title: "Secure Checkout & Multi-Gateway Licensing (Stripe, eSewa, Khalti)",
    imageUrl: "https://lh3.googleusercontent.com/aida/AEtjO1VZUQzq_a8oPbkt3lTqtC3ymttrHK3q0T_MjT2DuZxwLCC_MVG6W8hFzo7-mEOMId1EnNmmEb938bxybRBrnsMe_RYazC9OkHOSTLwqsurgM_8Oekv1aOoCssFOp5zok7-fE_j_Hq9UFy7ysHGmvWGD3ksCIhMws_iN0eU9qq1LZdtG3AlG7u9KQOMlyk3aeigNd-1v7iRiuqyriF86Wg3POuWXsQ72hKCoweaSEzUJrA",
    htmlUrl: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJyEgxzdGl0Y2hfZmlsZXMaYgosc3RpdGNoX2h0bWxfMDAwNjVkMjEyZTEwZmFiYjAzNmM0OWEzODUwMGRiMDQSCxIHELG0p6KaCBgBkgEkCgpwcm9qZWN0X2lkEhZCFDEyNTE4MzI4OTg3MDc5MTMyNzk1&filename=&opi=89354086",
  },
  {
    id: "e46b1c833efa485c806e08ac44c15961",
    folder: "stitch/screen-5-blog",
    title: "Field Journal — Expedition Dispatches & Editorial Blog",
    imageUrl: "https://lh3.googleusercontent.com/aida/AEtjO1VMKT59dxXSV_mNdkDZwVMbawEvdIRLVx5sTx8XHWNxmYQDIxxQoR0Gb-1mZiKRZZxaQqJ7RWoanX0bGFNqaahDZmboRKzcDs6_hvDZQ3i4l5lGA5XDtwP916Z95Tp8qOMPu9nFjw9GCPlTUjxezqjjBwCa7FsIeDc0OnxywpnS6jnLR6_qOBt0VWy4S3IUf-FUeHWBqoL2W2QN38cWvscQcgmR5Co6g89CP2wMN69boA",
    htmlUrl: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJyEgxzdGl0Y2hfZmlsZXMaYgosc3RpdGNoX2h0bWxfMDAwNjVkMjEyZDczMGE2NjA3M2FjZjIzZGMwMDk1MTcSCxIHELG0p6KaCBgBkgEkCgpwcm9qZWN0X2lkEhZCFDEyNTE4MzI4OTg3MDc5MTMyNzk1&filename=&opi=89354086",
  },
];

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.statusText} (${res.status})`);
  }
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));
  console.log(`Saved: ${destPath} (${buffer.byteLength} bytes)`);
}

async function run() {
  for (const s of screens) {
    const dir = path.resolve(process.cwd(), s.folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    console.log(`Downloading Screen: ${s.title} (${s.id})`);
    
    // 1. Download image
    const imagePath = path.join(dir, "screenshot.png");
    await downloadFile(s.imageUrl, imagePath);

    // 2. Download code / HTML
    const htmlPath = path.join(dir, "index.html");
    await downloadFile(s.htmlUrl, htmlPath);

    // 3. Write metadata.json
    fs.writeFileSync(
      path.join(dir, "metadata.json"),
      JSON.stringify(
        {
          id: s.id,
          title: s.title,
          folder: s.folder,
          imageUrl: s.imageUrl,
          htmlUrl: s.htmlUrl,
          downloadedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );
  }
  console.log("All Stitch screens downloaded successfully!");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
