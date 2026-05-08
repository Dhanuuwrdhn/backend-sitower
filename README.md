# Backend SiTower

NestJS REST API untuk sistem pemantauan tower transmisi PLN UIW Banten.

## Deskripsi

Backend SiTower adalah aplikasi REST API yang dibangun dengan NestJS untuk mengelola data tower transmisi, laporan, sertifikat, dan as-built drawing. Sistem ini menggunakan Prisma sebagai ORM dengan PostgreSQL sebagai database.

## Fitur

- **Autentikasi & Otorisasi**: JWT-based authentication dengan role-based access control
- **Manajemen Tower**: CRUD operasi untuk data tower transmisi
- **Laporan**: Upload dan manajemen laporan dalam format Excel
- **Sertifikat**: Upload dan tracking sertifikat tower
- **As-Built Drawing**: Upload dan penyimpanan gambar as-built
- **Import Data**: Import data dari file Excel
- **API Documentation**: Swagger UI untuk dokumentasi API

## Tech Stack

- **Framework**: NestJS 11
- **ORM**: Prisma 7
- **Database**: PostgreSQL
- **Authentication**: JWT + Passport
- **File Upload**: Multer
- **Validation**: class-validator
- **Documentation**: Swagger

## Quick Start

1. Clone repository
2. Install dependencies: `npm install`
3. Setup environment variables (lihat SETUP.md)
4. Setup database: `npx prisma migrate dev`
5. Run development server: `npm run start:dev`

## Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugger

# Production
npm run build             # Build application
npm run start:prod        # Start production server

# Database
npx prisma migrate dev    # Run migrations
npx prisma generate       # Generate Prisma client
npx prisma studio         # Open Prisma Studio

# Testing
npm run test              # Run unit tests
npm run test:e2e          # Run e2e tests
npm run test:cov          # Run tests with coverage

# Linting & Formatting
npm run lint              # Run ESLint
npm run format            # Format code with Prettier
```

## API Documentation

Ketika server berjalan, akses Swagger UI di: `http://localhost:3001/api`

## Environment Variables

Lihat file `SETUP.md` untuk konfigurasi environment variables yang diperlukan.

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/nama-fitur`
3. Commit changes: `git commit -m 'feat: tambah fitur baru'`
4. Push to branch: `git push origin feature/nama-fitur`
5. Create Pull Request

## License

UNLICENSED
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
