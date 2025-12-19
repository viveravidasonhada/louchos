
# Arquitetura do Sistema LaunchOS

Este documento descreve a arquitetura técnica e o fluxo de dados do LaunchOS.

## Visão Geral

LaunchOS é uma Single Page Application (SPA) construída com React, TypeScript e Vite. Ela atua como uma interface inteligente para orquestração de lançamentos digitais, integrando IA generativa com gestão de tarefas.

### Stack Tecnológica

*   **Frontend:** React 18, TypeScript, Vite.
*   **Estilização:** Tailwind CSS, Lucide React (Ícones).
*   **Inteligência Artificial:** Google Gemini 2.5 Flash via `@google/genai` SDK.
*   **Backend / Banco de Dados:** Supabase (PostgreSQL, Realtime, Auth - Simulado/Customizado).
*   **Gerenciamento de Estado:** React Hooks (`useState`, `useEffect`, `useReducer`).

## Fluxo de Dados

1.  **Entrada de Dados:** O administrador insere os dados do lançamento (Expert, Nicho, Verba, Datas).
2.  **Processamento IA:**
    *   O frontend envia um prompt estruturado para o Gemini 2.5 Flash.
    *   O prompt inclui o "Blueprint" selecionado (instruções de faseamento) e o "Contexto do Expert" (Knowledge Base).
    *   O Gemini retorna um JSON validado via `responseSchema` contendo fases, tarefas e exemplos práticos.
3.  **Persistência:**
    *   O JSON gerado é salvo na tabela `projects` (coluna `strategy_json`).
    *   Simultaneamente, o sistema "explode" esse JSON em tabelas relacionais (`launch_phases`, `launch_tasks`) para permitir gestão de estado granular (Kanban).
4.  **Sincronização:**
    *   Ao carregar um projeto, o sistema busca o JSON rico (para textos e exemplos) e mescla com os status atualizados da tabela relacional de tarefas.

## Estrutura de Pastas

*   `/components`: Componentes React da UI (Dashboard, Forms, Managers).
*   `/services`: Integrações externas (Gemini, Supabase).
*   `/types`: Definições de tipos TypeScript (Interfaces compartilhadas).
*   `/documentation`: Documentos de suporte.

## Segurança e Acesso

*   O sistema utiliza um login simplificado para MVPs, com um "Admin Backdoor" e usuários baseados em e-mail cadastrado na tabela `team`.
*   A API Key do Google e credenciais do Supabase são injetadas via variáveis de ambiente ou hardcoded para este ambiente de demonstração.
