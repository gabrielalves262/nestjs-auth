# Nest.Js Auth

Sistema de autênticação com NestJs

![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

## Funcionalidades

- Criação de conta com validação de email
- Login com credenciais de email e senha
- Autênticação 2FA
- Redefinição de senha
- Envio de emails com nodemailer

## Instalação

Este projeto utiliza [node](http://nodejs.org) e [npm](https://npmjs.com). Verifique se você possui instalados localmente.

```sh
$ npm install
```
Crie um arquivo .env e o preencha com as configuração abaixo

```env
# Configuração ----------------------------------------------

JWT_SECRET=[Senha secreta para o JWT]

# Url do frontend que irá ser recebido no email
REDIRECT_FRONTEND_URL="http://localhost:3000"

# Database --------------------------------------------------

DATABASE_URL="[URL de comunicação com o banco de dados]"

# Email -----------------------------------------------------

EMAIL_HOST="[Host do servidor de email]"
EMAIL_PORT=[Porta do servidor de email]
EMAIL_USERNAME="[Usuário]"
EMAIL_PASSWORD="[Senha]"

# Redis - Caso utilize --------------------------------------

REDIS_HOST="[Host Redis]"
REDIS_PORT=[Porta Redis]
```

OPCIONAL: Execute o docker compose caso não possua nenhum banco de dados e/ou Redis
```sh
$ docker compose up -d
```


Execute os comandos do prisma
```sh
$ npx prisma generate
$ npx prisma migrate dev --name init
```

Inicie a plicação
```sh
$ npm run start
```


## Endpoints

- [Sign In](#sign-in)
- [Sign Up](#sign-up)
- [Confirmar Email](#confirm-email)
- [Resetar Senha](#reset-password)
- [Alterar senha com token](#change-password-with-token)

---

### Sign In

_Realiza o login e retorna um Bearer Token_

<span style="color:#22c55e">POST</span> - `/auth/signin`

```json
{
  "email": "jhon.due@mail.com",
  "password": "Asdf:1234",
  "code": "674227"
}
```
| Atributo | Tipo | Descrição |
|---|---|---|
| email | string (email) | Email do usuário |
| password | string | Senha do usuário |
| code | string | Código 2FA enviado ao email do usuário caso esteja ativado |


<span style="color:#22c55e">200</span> - OK

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHdxb29sOGIwMDAzMTBjeGwwNnk3c2xwIiwibmFtZSI6Ikpob24gRHVlIiwiZW1haWwiOiJqaG9uLmR1ZUBtYWlsLmNvbSIsImlhdCI6MTcxNjkxODE4MiwiZXhwIjoxNzE3NTIyOTgyfQ.ZCe8w0Nq0l6_X-njClT-pQzWkXzAWz263liaii3ddkk"
}
```

<span style="color:#ef4444">401</span> - Unauthorized

```json
{
  "message": "CREDENTIALS_INVALID",
  "error": "Unauthorized",
  "statusCode": 401
}
```

| mensagem | descrição |
|----------|-----------|
| CREDENTIALS_INVALID | Credenciais inválidas |
| CONFIRM_EMAIL | Email não verificado. (Email de verificação enviado) |
| 2FA_REQUIRED | Necessário código 2FA. (Email com código enviado) |
| 2FA_INVALID_CODE | Código 2FA inválido |
| 2FA_EXPIRED_CODE | Código 2FA expirado (15 minutos) |

---

### Sign Up

_Realiza o cadastro de um novo usuário e envia um email de verificação_

<span style="color:#22c55e">POST</span> - `/auth/signup`

```json
{
  "email": "jhon.due@mail.com",
  "password": "Asdf:1234",
  "name": "Jhon Due",
  "picture": null
}
```
| Atributo | Tipo | Descrição |
|---|---|---|
| email | string (email) | Email do usuário |
| password | string | Senha do usuário |
| name | string | Nome completo do usuário |
| picture | string (url), null, undefined | Foto do usuário |


<span style="color:#22c55e">201</span> - Created

```json
{
  "success": "CONFIRM_EMAIL"
}
```
| mensagem | descrição |
|----------|-----------|
| CONFIRM_EMAIL | Email de verificação enviado |


<span style="color:#ef4444">409</span> - Conflit

```json
{
  "message": "EMAIL_ALREADY_EXISTS",
  "error": "Conflict",
  "statusCode": 409
}
```
| mensagem | descrição |
|----------|-----------|
| EMAIL_ALREADY_EXISTS | Email já cadastrado |

---

### Confirm Email

_Realiza a verificação do email cadastrado_

<span style="color:#22c55e">POST</span> - `/auth/confirm`

```json
{
  "token": "123456",
}
```
| Atributo | Tipo | Descrição |
|---|---|---|
| token | string | Token de verificação enviado ao email do usuário |

<span style="color:#22c55e">200</span> - OK

```json
{
  "success": "EMAIL_CONFIRMED"
}
```
| mensagem | descrição |
|----------|-----------|
| EMAIL_CONFIRMED | Email verificado |

<span style="color:#ef4444">400</span> - Bad Request

```json
{
  "message": "INVALID_TOKEN",
  "error": "Bad Request",
  "statusCode": 400
}
```
| mensagem | descrição |
|----------|-----------|
| INVALID_TOKEN | Token inválido |
| EXPIRED_TOKEN | Token expirado |
| INVALID_USER | Usuário inválido / não encontrado |

---

### Reset Password

_Envia um código de redefinição de senha ao usuário_

<span style="color:#22c55e">POST</span> - `/auth/reset`

```json
{
  "email": "jhon.due@mail.com",
}
```
| Atributo | Tipo | Descrição |
|---|---|---|
| email | string (email) | Email do usuário |

<span style="color:#22c55e">200</span> - OK

```json
{
  "success": "EMAIL_SENT"
}
```
| mensagem | descrição |
|----------|-----------|
| EMAIL_SENT | Foi enviado um email com um código de redefinição ao usuário |

<span style="color:#ef4444">404</span> - Not Found

```json
{
  "message": "USER_NOT_FOUND",
  "error": "Not Found",
  "statusCode": 404
}
```
| mensagem | descrição |
|----------|-----------|
| USER_NOT_FOUND | Usuário não encontrado |


---

### Change Password with Token

_Altera a senha do usuário_

<span style="color:#22c55e">POST</span> - `/auth/change`

```json
{
  "token": "123456",
  "password": "DDEAs@!a44568*"
}
```
| Atributo | Tipo | Descrição |
|---|---|---|
| token | string | Token de redefinição de senha |
| password | string | Nova senha definida pelo usuário |

<span style="color:#22c55e">200</span> - OK

```json
{
  "success": "PASSWORD_CHANGED"
}
```
| mensagem | descrição |
|----------|-----------|
| PASSWORD_CHANGED | Senha alterada |

<span style="color:#ef4444">400</span> - Bad Request

```json
{
  "message": "INVALID_TOKEN",
  "error": "Bad Request",
  "statusCode": 400
}
```
| mensagem | descrição |
|----------|-----------|
| INVALID_TOKEN | Token inválido |
| EXPIRED_TOKEN | Token expirado |
| INVALID_USER | Usuário inválido / não encontrado |