crie um mapa mental onde vou definir e criar as funcionalidades de cada parte do sistema  Dizimo Digital

Dizimo Digital.
O Dizimo Digital é uma ferramenta que possibilita as CEBs registrarem seus dizimostas e docoes, bem como a paroquia, ter de forma centralizada os totais repassados e doados

Requisitos
Tela de login: 
- Selecionar Administrativo, Paroquial, Comunidade 
  - Em Administrativo, tem Login e Senha
  - Em Paróquia tem a lista de paroquias cadastradas por nome, podendo digitar o nome ou o código da paroquia para selecionar mais rápido e campo de senha, onde terá a opção lembrar dados de login, onde irá salvar a paróquia selecionada, para faciliar a próxima vez que for fazer login 
  - Em CEBs, deverá selecionar a paróquia, onde ter que selecionar a páróquia por nome ou id digitando, selecionar a comunidade que está vinculada aquela paróquia, deve ter também o botão de lembrar dados de login, onde irá lembrar a paróquia e a comunidade selecionada, para facilitar o login da proxima vez.
- Tela de login administrativo, diferente do login de paroquia e CEBs
- Terá três áreas do sistema:
  - Área Administrativa
  - Área Paroquial
  - Área CEBs

Area Administrativa
- Senha no primeiro login, onde o sistema irá solicitar a criação de uma senha para o administrador, onde irá salvar no banco de dados, para depois fazer login normalmente, e ter acesso a área administrativa do sistema, onde poderá cadastrar as paroquias e as comunidades, além de ter acesso aos relatórios e dashboards do sistema.

- O cadastro administrativo terá as funcionalidades:
  - CRUD de cadastro de paroquias
  - Reset de senha de paroquia

- CRUD de cadastro de paroquias:
  - Cadastrar paroquias dentro da área administrativa
    - email
    - telefone 
    - endereço 
    - fundação 
    - cnpj
    - pároco
    - cadastro da paroquia um email para ser a senha da secretaria paroquial, onde será a conta principal admin da paróquia
  - Resetar senha de paroquia:
    - O administrador do sistema, poderá resetar a senha da paroquia, onde irá solicitar a senha do administrador para confirmar a ação, depois irá solicitar a nova senha para a paroquia, e depois irá salvar a nova senha no banco de dados, para que a paroquia possa fazer login com a nova senha.
    - 

Área paroquial
- A área paroquial, terá as seguintes funcionalidades:
  - Configuração da paróquia:
    - Configuração do percentual de repasse do dizimo, onde a paróquia irá cadastrar o percentual de repasse do dizimo, para que o sistema possa calcular o valor do repasse do dizimo, e mostrar no dashboard paroquial e das CEBs e relatório de dizimo.
    - A paróquia realizando a modificação do percentual, deve gerar um alerta para cada CEBs, mostrando logo ao realziar login, que houve uma modificação no percentual de repasse do dizimo, e mostrar o percentual antigo e o novo percentual, para que as CEBs possam se organizar financeiramente com a mudança do percentual de repasse do dizimo.
    - Ao modificar o percentual, não vai modificar os valores de repasses dos meses anteriores, deve mudar apenas no mes corrente, atualizando automaticamente assim que as comunidades marcarem como atualizar o percentual de repasse do dizimo e oferta.
    - Campo de percentual repasse dizimo CEBs
    - Campo de percentual repasse oferta CEBs
    - Campo de percentual repasse Curia Diocesana
    - Campo de percentual repasse Diocese
  - CRUD de cadastro de CEBs
  - Reset de senha de CEBs
  - Dashboard de dizimo, onde irá mostrar o total de dizimo arrecadado, total de doações, total de ofertas, total de repasses, percentual de repasse, repasse por mês e por ano, onde a paroquia poderá baixar esses dados em formato excel ou pdf.
  - Relatório de dizimo, onde irá mostrar o total de dizimo arrecadado, total de doações, total de ofertas, total de repasses, percentual de repasse, repasse por mês e por ano, onde a paroquia poderá baixar esses dados em formato excel ou pdf.
  - Requisitos CRUD de CEBs:
    - Cadastrar CEBs dentro da área paroquial, onde irá solicitar o nome da CEBs, o email para ser a senha da CEBs, onde será a conta principal admin da CEBs, e o telefone de contato da CEBs.
    - Resetar senha de CEBs:
      - O administrador da paroquia, poderá resetar a senha da CEBs, onde irá solicitar a senha do administrador para confirmar a ação, depois irá solicitar a nova senha para a CEBs, e depois irá salvar a nova senha no banco de dados, para que a CEBs possa fazer login com a nova senha.
  - Cada CEB cadastrada, estárá vinculada diretamente com o ID no banco de dados com a chave estrangeira da paróquia
  - O vinculo da paróquia é 1:N, onde uma paróquia pode ter várias CEBs
  - Lista de CEBs cadastradas na tela 
  - Campos do CRUD de CEBs:
    - Nome da CEBs
    - Email para ser a senha da CEBs que será utilizado pelo coordenador da CEBs, Tizoreiro e Coordenador do Dízimo
    - Lista de Conselheiros cadastrados dentro da CEB pela Área Comunidade
  - Cadastro de Pastorais e movimentos:
    - CRUD de cadastro pastorais e movimentos, cadastro simples que será uma lista para as CEBs selecionarem na hora do cadastro do conselheiro comunitário
      - Lista de pastorais e movimentos:(Vir pré cadastrado, mas como CRUD, onde poderar alter, excluir e cadastrar novas pastorais e movimentos)
      - Coordenacor Comunitário
      - Tesoureiro
      - Secretário
      - Pastoral do Dízimo
      - Pastoral da Liturgia
      - Pastoral do Canto/Litúrgica Musical
      - Pastoral dos Coroinhas
      - Pastoral dos Acólitos
      - Pastoral dos Leitores
      - Pastoral da Acolhida
      - Pastoral da Comunicação (PASCOM)
      - Pastoral do Batismo
      - Pastoral da Crisma
      - Pastoral da Catequese
      - Pastoral Familiar
      - Pastoral Matrimonial
  - Dashboard de dizimo:
    - Visão Geral ou por CBs, onde irá mostrar as seguintes informações:
      - Total de dizimo arrecadado 
      - Total de doações
      - Total de ofertas
      - Total de repasses
    - Percentual de repasse para a diocese e curia diocesanda, ver depois a regra, mas inicialmente é o total de repassado das comunidades para a paróquia, 
    - Repassse por mês
    - Repassse por ano
    - Opção de baixar esses dados em formato excel ou pdf.
    - Ter Filtro par para selecionar o período, a CEB e ver as informações de cadastros pot CEBs, onde o filtro de período, pode ser por mês, trimestre, semestre ou ano.

Área CEBs
  Cadastro de conselheiro comunitário:
        - Nome
        - Telefone
        - Email
        - Cargo
        - Chave estrangeira da CEB com o cadastro do Conselheiro comunitário, onde o conselheiro pode estar vinculado diretamente a CEB
        - Deverá ser apenas um cadastro simples, para a paróquia ter controle
  - Cadastro Dizimista:
    - Nome
    - Telefone 
    - Email (opcional)
    - Endereço
    - Data de nascimento
  - Cadastro de doações:
    - Valor da doação
    - Mês e ano da doação (Seleciona de forma automática o mês e ano atual, mas pode ser editado para selecionar o mês e ano da doação)
    - Tipo da doação (dízimo, oferta, doação)
    - Forma de pagamento (dinheiro, pix, transferência bancária)
    - Observações (opcional)
 
  - Dashboard com as seguintes informações:
    - Total de dizimo arrecadado
    - Total de doações
    - Total de ofertas
    - Total de repasse de Dizimo do mês, calculado no percentual cadastrado pela paróquia
    - Total de repasse de Ofertas do mês, calculado no percentual cadastrado pela paróquia
    - Repassse por ano
    - Percentual de repasse cadastrado pela paróquia
    - Opção de baixar esses dados em formato excel ou pdf.
    - Ter Filtro par para selecionar o período, onde o filtro de período, pode ser por mês, trimestre, semestre ou ano.

Regras Gerais:
- O sistema deve ser responsivo, para que possa ser acessado tanto em computadores quanto em dispositivos móveis.
- O sistema deve ter um design intuitivo e fácil de usar, para que os usuários possam navegar facilmente pelas funcionalidades do sistema.
- O sistema deve ser seguro, para proteger os dados dos usuários e das paróquias, utilizando criptografia para senhas e dados sensíveis.
- O sistema deve criptografar os dados sensiveis como senhas, utilizando algoritmos de criptografia seguros, como bcrypt ou Argon2, para garantir a proteção dos dados dos usuários.
- O sistema deve criptografar os dados sensiveis como informações pessoais dos dizimistas, utilizando algoritmos de criptografia seguros, para garantir a proteção dos dados dos usuários. (não implementar agora, mas deixar a estrutura do banco de dados preparada para isso, para que no futuro possa ser implementado a criptografia dos dados sensíveis dos dizimistas)

- Uma paróquia deverá ter o campo de configurações, onde irá configurar: 
  - Percentual de repasse dizimo CEBs
  - Percentual de repasse oferta CEBs
  - Percentual de repasse Curia Diocesana
  - Percentual de repasse Diocese
- Paróquia 1:n CEBs
- CEBs 1:n Conselheiros Comunitários
- CEBs 1:n Dizimistas (Mas pode acontecer de ter Dizimista doando o dizimo em mais de uma CEBs, porém terá seu hash de identificaçaõ diferente)
- CEBs 1:n Doações
- Cada cadastro deve ter um hash id de identificação único, para garantir a segurança e integridade dos dados, e para facilitar a identificação dos registros no banco de dados. O hash id deve ser gerado utilizando algoritmos de hash seguros, como SHA-256 ou bcrypt, para garantir a proteção dos dados dos usuários. O hash id deve ser utilizado como chave primária para os registros no banco de dados, para garantir a integridade dos dados e facilitar a identificação dos registros.

- O sistema deve ter duas URLs de login, uma do login para Area Administrativa, onde irá fazer o cadastro inicial da Paróquia, e outra URL para o login da Área Paroquial e CEBs, onde as paróquias e CEBs irão fazer login para acessar suas respectivas áreas do sistema. A URL de login para a Área Administrativa deve ser diferente da URL de login para a Área Paroquial e CEBs, para garantir a segurança do sistema e evitar confusões entre os usuários.