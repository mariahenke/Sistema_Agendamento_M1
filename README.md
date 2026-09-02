## Autoras

- Maria Isabel Henke
- Yasmin Inturn

# SalaViva — Sistema de Agendamento de Salas e Laboratórios

Aplicação web para gerenciar reservas de salas de aula e laboratórios de um campus, com controle de conflitos de horário e métricas por turno.

## Funcionalidades

- Cadastro de novos agendamentos (solicitante, bloco, sala, data e turno)
- Seleção dependente: as salas disponíveis mudam de acordo com o bloco escolhido
- Validação de conflito: impede reservar a mesma sala, no mesmo turno e na mesma data
- Exclusão de agendamentos
- Métricas em tempo real: total de reservas e quantidade por turno (Manhã, Tarde, Noite)
- Estado vazio: alerta quando não há nenhuma reserva cadastrada

## Tecnologias

- HTML5
- CSS3 (estilos próprios, sem framework de build)
- JavaScript puro (ES Modules)
- [Bootstrap 5](https://getbootstrap.com/) e [Bootstrap Icons](https://icons.getbootstrap.com/) via CDN

## Estrutura do projeto

```
.
├── index.html      # Estrutura da página e marcação Bootstrap
├── styles.css       # Estilos visuais (cores, tipografia, componentes)
├── dados.js         # Dados iniciais (infraestrutura de blocos/salas, turnos)
├── app.js           # Lógica da aplicação (renderização, validação, eventos)
└── README.md
```

## Como executar

Este projeto não tem etapa de build — é HTML/CSS/JS puro. Como `app.js` usa ES Modules (`import`/`export`), ele **precisa** ser servido por um servidor local; não funciona abrindo o `index.html` direto no navegador (`file://`).

**Opção 1 — Live Server (VS Code)**
1. Instale a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
2. Clique com o botão direito em `index.html` → **Open with Live Server**.

**Opção 2 — via terminal**
```bash
npx serve .
```
Depois acesse o endereço indicado (ex.: `http://localhost:3000`).
