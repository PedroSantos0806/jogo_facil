# ⚽ Jogo Fácil

Sistema profissional de agendamento de partidas de futebol com inteligência artificial.

## 🚀 Funcionalidades

*   **Busca de Partidas:** Encontre adversários ou campos disponíveis.
*   **Gestão de Campos:** Painel para donos de quadras gerenciarem horários.
*   **Validação via IA:** O sistema usa a Gemini API para analisar comprovantes de PIX automaticamente, evitando fraudes.
*   **Assinaturas:** Sistema de planos (Semanal, Mensal, Anual).
*   **Recorrência:** Criação automática de agenda para times mensalistas.

## 🛠️ Tecnologias

*   React + TypeScript
*   Tailwind CSS
*   Google Gemini API (Verificação de Pagamentos)
*   Lucide React (Ícones)

## 📦 Como rodar

Este projeto está configurado para rodar no **Railway**.

1.  Certifique-se de definir a variável de ambiente `API_KEY` nas configurações do projeto com sua chave da Google AI Studio.

## 🔒 Segurança

O sistema possui níveis de acesso:
*   **Admin:** Acesso total.
*   **Dono de Campo:** Gerencia sua grade de horários.
*   **Capitão:** Busca jogos e envia pagamentos.
