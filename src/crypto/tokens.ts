/*
JSON Web Tokens consist of three parts xxxxx.yyyyy.zzzzz:
* Header: Type of token and signature algorithm
{
  "alg": "HS256",
  "typ": "JWT"
}
Then, this JSON is Base64Url encoded to form the first part of the JWT.
* Payload
The second part of the token is the payload, which contains the claims (registered, public, private).
{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true
}
The payload is then Base64Url encoded to form the second part of the JWT.
* Signature
To create the signature part you have to take the encoded header, the encoded payload, a secret, the algorithm specified in the header, and sign that.
*/
