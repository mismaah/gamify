# Gamify

## Development

- Clone `.env.example` and rename to `.env`.
- Fill database url in `.env`.
- Run db migration.

```bash
npx prisma migrate dev
```

- Start next.js in development mode.

```bash
npm run dev
```

## Deployment

- Docker build. Database url is passed in build step to perform db migration.

```bash
docker build --build-arg DATABASE_URL="postgresql://user:password@host:5432/gamify" . -t gamify
```

- Docker run. Map to whichever host port. In this example 4010 is used.

```bash
docker run -d --restart unless-stopped -e DATABASE_URL="postgresql://user:password@host:5432/gamify" -p 4010:3000 --name gamify gamify
```

## T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

### What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

### Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!
