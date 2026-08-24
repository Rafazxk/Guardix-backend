# Guardix: Engine Anti-Fraude 

O **Guardix** é uma API Backend de alta performance desenvolvida em Node.js, focada em análise antifraude baseada em regras dinâmicas, cálculo de score e classificação de risco em tempo real.

---

## Arquitetura do Projeto
O sistema foi construído sob os princípios da **Clean Architecture**, garantindo total desacoplamento entre as regras de negócio e as ferramentas externas (banco de dados/HTTP).

### Divisão de Camadas:
- **Controller (HTTP):** Interface de entrada. Responsável apenas por receber requisições e retornar respostas.
- **Service (Aplicação):** Orquestrador do fluxo. Coordena a execução das regras, cálculo de score e persistência.
- **Domain (Negócio):** O coração do sistema. Contém a lógica pura de análise, sem dependências externas.
- **Repository (Infra):** Camada de comunicação exclusiva com o **PostgreSQL**.

---

## Estrutura de Diretórios
```bash
src/
 ├── controllers/    # Handlers de requisição
 ├── services/       # Orquestração de casos de uso
 ├── routes/         # Definição de endpoints
 ├── domain/         # Lógica pura (Rules, Scoring, Classification)
 ├── repositories/   # Camada de dados (SQL)
 ├── config/         # Variáveis e setups
 └── utils/          # Helpers e utilitários
```
## Fluxo de Análise
O motor de análise segue um pipeline rigoroso para garantir a integridade do score:

1. Controller recebe a consulta.

2. Service dispara as Rules (Regras de Negócio).

3. ScoreCalculator processa as pontuações acumuladas.

4. RiskClassifier define a categoria de risco.

5. Repository persiste a consulta e os detalhes no banco.

6. Controller entrega o veredito ao cliente.

## Tecnologias e Requisitos
- Runtime: Node.js 18+

- Banco de Dados: PostgreSQL 14+

- Segurança: Lógica de Hash para proteção de dados sensíveis.

### 1. Instalação
Clone o repositório:
```Bash
git clone [https://github.com/Rafazxk/anti-fraude.git](https://github.com/Rafazxk/anti-fraude.git)
```

### 2. Instale as dependências:
```Bash
npm install
```
### 3. Configure o arquivo .env:
```bash
PORT=3000
DATABASE_URL=seu_postgresql_url
Inicie o servidor:
```
### inicie o servidor: 
```Bash
node src/server.js
```

## Modelagem de Dados (ERD)
O sistema utiliza um esquema relacional otimizado para auditoria de fraudes:

- Users: Gestão de planos e credenciais.

- Consultas: Registro principal do veredito e score.

- Consulta_Detalhes: Histórico detalhado de quais regras foram ativadas e por quê.

## Expansibilidade: Adicionando Regras
O sistema foi desenhado para ser extensível. Para adicionar uma nova regra, basta criar um novo arquivo em src/domain/rules/ seguindo o contrato padrão:
```bash
JavaScript
class NovaRegra {
  constructor(repository) { this.repository = repository; }
  async execute(dados) {
    // Lógica de verificação
    return { regra: "NOME", pontuacao: 50, mensagem: "..." };
  }
}
```

## Road Map & Evoluções
- [ ] Implementação de Autenticação via JWT.

- [ ] Motor de regras dinâmicas via Dashboard.

- [ ] Documentação interativa com Swagger.

- [ ] Cobertura de testes unitários.

---
Desenvolvido por Rafael Silva
Projeto focado em arquitetura avançada de sistemas e segurança de dados.