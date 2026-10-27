# Certificados HTTPS

`cacert.pem` é o pacote de autoridades certificadoras do projeto curl, baseado no repositório Mozilla. Ele permite que o PHP valide o certificado HTTPS da BrasilAPI em instalações que não configuraram `curl.cainfo`.

Fonte: https://curl.se/docs/caextract.html

Atualização: baixe `https://curl.se/ca/cacert.pem` e confira o SHA-256 publicado em `https://curl.se/ca/cacert.pem.sha256` antes de substituir este arquivo. A verificação TLS deve permanecer ativa.

SHA-256 desta versão: `796f1389bfea13c0ed78f663b765baaff54a508e5483786bd6ece73c5e3e3cbe`.
