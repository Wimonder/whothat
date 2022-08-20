<div id="top" align="center">

[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

</div>

<div align="center">
  <h3 align="center">WhoThat</h3>

  <p align="center">
    A simple authentication server generating JWT access and refresh tokens for users.
    <br/>
    <b>DO NOT USE THIS IN PRODUCTION, USE A REAL AUTHENTICATION SERVER INSTEAD.</b>
    <br />
    <a href="https://whothat.wimon.dev/">See docs</a>
  </p>
</div>

<hr/>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about">About</a>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#scripts">Scripts</a></li>
      </ul>
    </li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

### Built With

- [Fastify](https://www.fastify.io/) - Web server
- [Zod](https://github.com/colinhacks/zod) - Request and response validation
- [Prisma](https://www.prisma.io/) - Database ORM
- [Swagger](https://swagger.io/) - API docs

<!-- ABOUT -->

## About

<!-- GETTING STARTED -->

## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

- npm
- node
- a public/private keypair for signing and verifying tokens, generate them using the following command:
  ```bash
  ssh-keygen -t rsa -b 4096 -m PEM -f jwt.key -N ""
  openssl rsa -in jwt.key -pubout -outform PEM -out jwt.key.pub
  ```
  The private key must be kept secret while the public key is shared with the applications who want to authenticate users.

### Installation

1. Clone the repo

```sh
git clone https://github.com/Wimonder/WhoThat/
```

2. Install NPM packages

```sh
npm install
```

3. Fill in the environment variables in `.env-template`
4. Rename `.env-template` to `.env`

### Scripts

#### Fastify

- build

```sh
npm run build
```

- start

```sh
npm run start
```

#### Prisma

- push schema changes

```sh
npx prisma db push
```

- prisma studio to inspect schema

```sh
npx prisma studio
```

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[issues-shield]: https://img.shields.io/github/issues/Wimonder/WhoThat.svg?style=for-the-badge
[issues-url]: https://github.com/Wimonder/WhoThat/issues
[license-shield]: https://img.shields.io/github/license/Wimonder/WhoThat.svg?style=for-the-badge
[license-url]: https://github.com/Wimonder/WhoThat/blob/main/LICENSE
