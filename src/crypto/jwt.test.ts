import crypto from "crypto";
import { create, verifyAndDecode } from "./jwt";

// Keys for testing
const pubKeyFile = `
-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA4RbOCrEsgTTZtx4I1u7E
WqrZ/7GDyPQG6vRzGx2MxgnwgMY7BYm608s/U2fw07ctm6IY0efZF5bLLdD9I2J5
4ttoau2PS/13Vqp4FS9r3dpd38HAhM2XsEA3ZIk49BC15I0Lp9xhEEF7YFsWWptq
RfB8lfw8W2vVXm7Niotucwo7O2heMLhmwi5FGnoy1UXvkMDmmdtO69oeusLZHNfy
6g30z4FXF01RjRgV2uGJZA9RCC/mIwJy0rRAfJoRzUlNLZ9S+AEkAJvKeX94a37Q
1IQueXbMpLHyM3zvCUBqGtlDq+yWux4bR3iF7YcOPpGWU0IYMluyhmjh13ulHX+0
6KsaPwLIGeTm/ysEokFPTDw8vlvy0JMvzN9hsUlV9F32Vdq7Hkr/8HstR4Eg78yS
icpc7OR0469AUmvfdsbUIjD1t6r4EhECDPA/fmDh0YvC4mbjbLXQ5wsN5LcQZnz7
1smxatvLOp5uluyf2X9w1SXGmhlgdyB6ZAUAM4Hi+HvL/TG1BqM3h2mzZk3mDqmH
GlwMJeqe0ueZXBFAI5FnI4rddYs/JfJF7htFOyTkb7zin9+OOARxvNhqrIiJBLuZ
fR168klNHtpZ1ceiZ6UHn8WQ0MOtjrRZG6Bna12N8Ax1RErwu1WMvP/SRoTWKbjL
1psMlylQPNtoKKFfrv9OdFECAwEAAQ==
-----END PUBLIC KEY-----
`;
const privKeyFile = `
-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----
`;
const pubKey = crypto.createPublicKey(pubKeyFile);
const privKey = crypto.createPrivateKey(privKeyFile);

test("should create a JWT", async () => {
  const data = { sub: "1234567890", name: "John Doe", admin: true };
  const token = await create({
    data,
    privateKey: privKey,
    options: {
      expiresAt: new Date("December 17, 1995 03:24:00").getTime(),
    },
  });
  expect(token).toBe(
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImV4cCI6ODE5MTY3MDQwMDAwfQ.AnN3_NGcgZMKGtlkrDeb5fbo4KdS4C7ivM2W4Lzss3P66FqoIoGZsV0MUnMg6BvKoBuXtGTtLWCaquqozNy2rWt6dg4w_6cQpjzfLt3gEZwGoeOgl3mPmh7mVsOjVp2SywSXXUHsDXlcmOvYahK2aOEIM1_hXM1vhBDxNblDqN2F2nnhDWmLqSnjL8sDxNmce4a8_rNZRnymgSI0JtVzgx8BnIRivvMSz-x-KUvOMJiSvO0-b8FldTpHBwlJTpQgt-rFW7C2ZojocUudLzZQu6XiLx01zT0g80rAUryU8su8cEjh4Ww7lFZo7BkR8omglrA4nm3Ew1E2a-brzf6X24JFxxmbZnwSRpiW_BE59_WGICX6J60p8dN47wZQaaJPsBIuYufVuUWLQoLqJdh8U5QTMcwwmgyVZjur8cqohx1PG-90yyNmWzcR7UiHgwrPQpNQN7KAcPRiYfjgOiMkAN3EftLWFwGYhFbeF71zL4JeXB4G1zb2I88Fd9POQRgSVfNHQ8A2BxVynazzhBdg5yDd7J1_gqZS9oF2jSkDkQrKbwggthoYhG8pEEySySUuo9bt8P1jLJfgtyYxpgEOFJ8-lVNb-Bixrj3VV0Tc9RDN_07j8Dwm5RU9VN4eCFh86ejrLCG8jZ8dWFJUsSAUKC8AmBn-rppgGHSDuoWwZuQ",
  );
});

test("should decode a valid JWT", async () => {
  const token =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImV4cCI6ODE5MTY3MDQwMDAwfQ.AnN3_NGcgZMKGtlkrDeb5fbo4KdS4C7ivM2W4Lzss3P66FqoIoGZsV0MUnMg6BvKoBuXtGTtLWCaquqozNy2rWt6dg4w_6cQpjzfLt3gEZwGoeOgl3mPmh7mVsOjVp2SywSXXUHsDXlcmOvYahK2aOEIM1_hXM1vhBDxNblDqN2F2nnhDWmLqSnjL8sDxNmce4a8_rNZRnymgSI0JtVzgx8BnIRivvMSz-x-KUvOMJiSvO0-b8FldTpHBwlJTpQgt-rFW7C2ZojocUudLzZQu6XiLx01zT0g80rAUryU8su8cEjh4Ww7lFZo7BkR8omglrA4nm3Ew1E2a-brzf6X24JFxxmbZnwSRpiW_BE59_WGICX6J60p8dN47wZQaaJPsBIuYufVuUWLQoLqJdh8U5QTMcwwmgyVZjur8cqohx1PG-90yyNmWzcR7UiHgwrPQpNQN7KAcPRiYfjgOiMkAN3EftLWFwGYhFbeF71zL4JeXB4G1zb2I88Fd9POQRgSVfNHQ8A2BxVynazzhBdg5yDd7J1_gqZS9oF2jSkDkQrKbwggthoYhG8pEEySySUuo9bt8P1jLJfgtyYxpgEOFJ8-lVNb-Bixrj3VV0Tc9RDN_07j8Dwm5RU9VN4eCFh86ejrLCG8jZ8dWFJUsSAUKC8AmBn-rppgGHSDuoWwZuQ";
  const data = await verifyAndDecode(token, pubKey);
  expect(data).toEqual({
    sub: "1234567890",
    name: "John Doe",
    admin: true,
    exp: 819167040000,
  });
});

test("should fail to verify an invalid JWT", async () => {
  const token =
    "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImV4cCI6ODE5MTY3MDQwMDAwfQ.AnN3_NGcgZMKGtlkrDeb5fbo4KdS4C7ivM2W4Lzss3P66FqoIoGZsV0MUnMg6BvKoBuXtGTtLWCaquqozNy2rWt6dg4w_6cQpjzfLt3gEZwGoeOgl3mPmh7mVsOjVp2SywSXXUHsDXlcmOvYahK2aOEIM1_hXM1vhBDxNblDqN2F2nnhDWmLqSnjL8sDxNmce4a8_rNZRnymgSI0JtVzgx8BnIRivvMSz-x-KUvOMJiSvO0-b8FldTpHBwlJTpQgt-rFW7C2ZojocUudLzZQu6XiLx01zT0g80rAUryU8su8cEjh4Ww7lFZo7BkR8omglrA4nm3Ew1E2a-brzf6X24JFxxmbZnwSRpiW_BE59_WGICX6J60p8dN47wZQaaJPsBIuYufVuUWLQoLqJdh8U5QTMcwwmgyVZjur8cqohx1PG-90yyNmWzcR7UiHgwrPQpNQN7KAcPRiYfjgOiMkAN3EftLWFwGYhFbeF71zL4JeXB4G1zb2I88Fd9POQRgSVfNHQ8A2BxVynazzhBdg5yDd7J1_gqZS9oF2jSkDkQrKbwggthoYhG8pEEySySUuo9bt8P1jLJfgtyYxpgEOFJ8-lVNb-Bixrj3VV0Tc9RDN_07j8Dwm5RU9VN4eCFh86ejrLCG8jZ8dWFJUsSAUKC8AmBn-xxxgGHSDuoWwZuQ";
  expect(verifyAndDecode(token, pubKey)).rejects.toThrow("Invalid token");
});

test("should fail to verify a JWT with an invalid signature", async () => {
  const token =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImV4cCI6ODE5MTY3MDQwMDAwfQ.AnN3_NGcgZMKGtlkrDeb5fbo4KdS4C7ivM2W4Lzss3P66FqoIoGZsV0MUnMg6BvKoBuXtGTtLWCaquqozNy2rWt6dg4w_6cQpjzfLt3gEZwGoeOgl3mPmh7mVsOjVp2SywSXXUHsDXlcmOvYahK2aOEIM1_hXM1vhBDxNblDqN2F2nnhDWmLqSnjL8sDxNmce4a8_rNZRnymgSI0JtVzgx8BnIRivvMSz-x-KUvOMJiSvO0-b8FldTpHBwlJTpQgt-rFW7C2ZojocUudLzZQu6XiLx01zT0g80rAUryU8su8cEjh4Ww7lFZo7BkR8omglrA4nm3Ew1E2a-brzf6X24JFxxmbZnwSRpiW_BE59_WGICX6J60p8dN47wZQaaJPsBIuYufVuUWLQoLqJdh8U5QTMcwwmgyVZjur8cqohx1PG-90yyNmWzcR7UiHgwrPQpNQN7KAcPRiYfjgOiMkAN3EftLWFwGYhFbeF71zL4JeXB4G1zb2I88Fd9POQRgSVfNHQ8A2BxVynazzhBdg5yDd7J1_gqZS9oF2jSkDkQrKbwggthoYhG8pEEySySUuo9bt8P1jLJfgtyYxpgEOFJ8-lVNb-Bixrj3VV0Tc9RDN_07j8Dwm5RU9VN4eCFh86ejrLCG8jZ8dWFJUsSAUKC8AmBn-xxxgGHSDuoWwZuQ";
  expect(verifyAndDecode(token, pubKey)).rejects.toThrow("Invalid signature");
});

test("should fail to verify an expired JWT ", async () => {
  const token =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImV4cCI6ODE5MTY3MDQwfQ.nmtBJcZe4iuJ4BUQG_ZUbvHZTnAgamndiMRJi2EygJJRYuHJH6WK2wiDpEDoGvTHgVM_tPcQxVeChFLrfrb3FRrGjF0xaqJH-Fk0ELZbyCrw-nffoEwhIi-Xmtvc-eM5BLvVg_hC7kNV9iReHYqXsSp23PgNRB6yhwuQny_SpwKdZLp-qWigNL42K92nUhET8NmJ0_C3PF2qQrcoWlfoUb3HFnAErDPs0vJwBzylkIjXNe0bTqnrTnA1KUIXV9eztC8jMF5xJk1e6N4ph7t5MJEGVoJMEugZTWRZPeicBviWf3cpGwgEKU0n6tGgAHmoaNwqdKZdSL9V2iouh5iF2NEqdZnESNZ1m29MPUUCpNsMl270QQkaCA164Bw-Y-CPLAoA6K6NbiLE3TLSNKuZOlrKIh507UXXolmQkmahQiiGGZpQ_1vcfrelw2ByT_luNitoWBjlR-CtHVFP-993m_C9kvSoAgcqXuDhx5rFgnkcVDQzHkoDdWuPVLFzKFdTxEo2I0X3a3sPDVspiauMKcYHexrJ9OnWH87rO6WzJO3dShfx9aS89SKnAYq-Y7I-Qeyzlg-yCrTZTzf4kIGNoypZ8mP_wvaSwAnR2Iu97PLR5pDN5KwedALrHnCgPMm4c6OHHzpKxI9nbWqp-vXV9vPwxqbHsF7bP3dSw4h7PDc";
  expect(verifyAndDecode(token, pubKey)).rejects.toThrow("Token expired");
});