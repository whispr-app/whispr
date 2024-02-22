<div align="center">
  <h1>💬 Whispr</h1>
  <p>The anonymous, decentralised & end-to-end encrypted messaging application</p>

<a href="/LICENSE">
  <img alt="GitHub" src="https://img.shields.io/github/license/morgandilling/ts-node-project-template?style=for-the-badge">
</a>

<b>🚧 Disclaimer: This project is still in development and is not yet ready for use 🚧</b>
</div>

## Setup

You will need:

- [Node.js](https://nodejs.org/en/) (latest LTS version)
- [pnpm](https://pnpm.io/)

### Instructions

1. Install dependencies with `pnpm install`.
2. Create a `.env` file in `packages/api` of the project with the following contents and replacing user, password, address, port and database with your MongoDB connection details:

```env
DATABASEURL="mongodb://user:password@address:port/database?authSource=admin"
```

3. Generate the prisma client by running `pnpm prisma:update` in the root directory.
4. You can then either run the project in development mode with `pnpm dev` or by building the project with `pnpm build` and then running the production build with `pnpm start`.

## Scripts

- `pnpm run start` - Run the project in production
- `pnpm run dev` - Run the project in development (with hot reloading)

## License

This project is licensed under [MIT](/packages/whispr-client/LICENSE) and [AGPL](/packages/whispr-server/LICENSE) for the client and server respectively.

## Credits

<b>👤 Morgan Dilling "MJD"</b>

- 💻 [Website](https://morgandilling.dev)
- 🛠️ [GitHub](https://github.com/morgandilling)
- 📧 [Email](mailto:business@morgandilling.dev)

## Contributing

Contributions, issues and feature requests are welcome! Check out the [Code of Conduct](.github/CODE_OF_CONDUCT.md) before contributing. For internal reasons, third-party pull requests won't be accepted until the Summer of 2024 (some exceptions may be made). Please contact me if you have any questions.
