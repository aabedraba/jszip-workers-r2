# Using JSZip with Cloudflare Workers and R2

Example of how to zip and unzip in Cloudflare Workers and uploading it to Cloudfalre's R2.

## Run

1. Install all dependencies

```sh
npm i
```

2. Get your cloudflare AccountId

```sh
npx wrangler whoami
```

Update the account ID in your `wrangler.toml` in the `ACCOUNT_ID` section.

3. Create an R2 bucket

You'll need to create one for production and another one for testing locally

```sh
npx wrangler r2 bucket create BUCKET_NAME
```

```sh
npx wrangler r2 bucket create PREVIEW_BUCKET_NAME
```

Replace the name of the buckets in your `wrangler.toml`

4. Run the worker

```sh
npx wrangler dev --local
```

Test that it works:

```sh
curl localhost:8787
{
  "config": "hello world"
}
```
