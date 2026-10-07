//
// FASE 1: Modelagem dos dados (Classe Base)
//
class Tarefa {
    constructor(texto, concluida = false) {
        this.texto = texto;
        this.concluida = concluida;
    }

    // Método que alterna entre concluída / pendente
    alternarConclusao() {
        this.concluida = !this.concluida;
    }
}

//
// FASE 2: Gerenciamento de Estado (Memória)
//
const listaDeTarefas = [];

//
// FASE 2.1: Persistência com localStorage
//
// Constantes para evitar erros de digitação ao usar as chaves do localStorage
const CHAVE_STORAGE = "painel_tarefas_lista";
const CHAVE_TEMA = "painel_tarefas_tema";

// 1. Função para SALVAR as tarefas no navegador
function salvarNoLocalStorage() {
    // JSON.stringify converte o Array de Objetos JS em uma String JSON
    const listaEmTexto = JSON.stringify(listaDeTarefas);
    localStorage.setItem(CHAVE_STORAGE, listaEmTexto);
}

// 2. Função para CARREGAR as tarefas salvas quando a página abrir
function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    // Se existirem dados salvos anteriormente no navegador...
    if (dadosSalvos) {
        // Converte a string JSON de volta para um Array de objetos genéricos
        const tarefasObjetos = JSON.parse(dadosSalvos);

        // ATENÇÃO (Conceito POO): Reinstanciamos cada tarefa com "new Tarefa()"
        // para garantir que os objetos recuperem o método .alternarConclusao()
        tarefasObjetos.forEach((tarefa) => {
            const tarefaInstanciada = new Tarefa(tarefa.texto, tarefa.concluida);
            listaDeTarefas.push(tarefaInstanciada);
        });
    }
}

//
// FASE 3: Captura de Elementos do DOM
//
const campoTarefa = document.getElementById("campo-tarefa");
const botaoAdicionar = document.getElementById("botao-adicionar");
const listaTarefasEl = document.getElementById("lista-tarefas");
const contadorTarefasEl = document.getElementById("contador-tarefas");
const botaoAlternarTema = document.getElementById("botao-alternar-tema");

//
// FASE 4: Escuta de Eventos
//

// 1. Adicionar tarefa pelo botão
botaoAdicionar.addEventListener("click", adicionarTarefa);

// 2. Adicionar tarefa apertando Enter no campo de texto
campoTarefa.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        adicionarTarefa();
    }
});

// 3. Alternar tema claro/escuro
botaoAlternarTema.addEventListener("click", function () {
    document.body.classList.toggle("modo-escuro");
    salvarTema();
    atualizarIconeTema();
});

//
// FASE 5: Funções de Ação, Atualização e Renderização da Interface
//

// Função responsável por criar e adicionar uma nova tarefa
function adicionarTarefa() {
    const texto = campoTarefa.value.trim();

    if (texto === "") {
        alert("Digite uma tarefa antes de adicionar!");
        return;
    }

    const novaTarefa = new Tarefa(texto);
    listaDeTarefas.push(novaTarefa);

    // Salva no localStorage sempre que uma nova tarefa for adicionada
    salvarNoLocalStorage();

    atualizarInterface();
    campoTarefa.value = "";
    campoTarefa.focus();
}

// Função responsável por marcar/desmarcar uma tarefa como concluída
function concluirTarefa(index) {
    listaDeTarefas[index].alternarConclusao();

    // Salva o novo estado da tarefa no localStorage
    salvarNoLocalStorage();

    atualizarInterface();
}

// Função responsável por remover uma única tarefa pelo índice
function removerTarefa(index) {
    listaDeTarefas.splice(index, 1);

    // Salva a nova lista (sem o item removido) no localStorage
    salvarNoLocalStorage();

    atualizarInterface();
}

// Função responsável por atualizar o contador de tarefas no rodapé
function atualizarContador() {
    const total = listaDeTarefas.length;
    const concluidas = listaDeTarefas.filter((tarefa) => tarefa.concluida).length;
    const palavra = total === 1 ? "tarefa" : "tarefas";

    contadorTarefasEl.textContent = `${total} ${palavra} na lista (${concluidas} concluída(s))`;
}

// Função responsável por re-desenhar a lista de tarefas
function renderizarLista() {
    listaTarefasEl.innerHTML = "";

    listaDeTarefas.forEach((tarefa, index) => {
        const item = document.createElement("li");
        item.classList.add("item-tarefa");
        if (tarefa.concluida) {
            item.classList.add("concluido");
        }

        // textContent evita que o texto digitado seja interpretado como HTML
        const textoEl = document.createElement("span");
        textoEl.textContent = tarefa.texto;

        const acoes = document.createElement("div");
        acoes.classList.add("acoes-tarefa");

        const btnConcluir = document.createElement("button");
        btnConcluir.classList.add("botao-acao", "concluir");
        btnConcluir.innerHTML = '<i class="fa-regular fa-circle-check"></i>';
        btnConcluir.addEventListener("click", () => concluirTarefa(index));

        const btnExcluir = document.createElement("button");
        btnExcluir.classList.add("botao-acao", "excluir");
        btnExcluir.innerHTML = '<i class="fa-solid fa-trash"></i>';
        btnExcluir.addEventListener("click", () => removerTarefa(index));

        acoes.appendChild(btnConcluir);
        acoes.appendChild(btnExcluir);
        item.appendChild(textoEl);
        item.appendChild(acoes);
        listaTarefasEl.appendChild(item);
    });
}

// Função principal que sincroniza a tela com os dados
function atualizarInterface() {
    renderizarLista();
    atualizarContador();
}

//
// FASE 5.1: Tema claro/escuro (também persistido no localStorage)
//
function salvarTema() {
    const modoEscuroAtivo = document.body.classList.contains("modo-escuro");
    localStorage.setItem(CHAVE_TEMA, modoEscuroAtivo ? "escuro" : "claro");
}

function carregarTema() {
    if (localStorage.getItem(CHAVE_TEMA) === "escuro") {
        document.body.classList.add("modo-escuro");
    }
}

function atualizarIconeTema() {
    const icone = botaoAlternarTema.querySelector("i");
    const modoEscuroAtivo = document.body.classList.contains("modo-escuro");

    icone.classList.toggle("fa-sun", modoEscuroAtivo);
    icone.classList.toggle("fa-moon", !modoEscuroAtivo);
}

//
// FASE 5.2: Saudação por horário, relógio e data
//
const saudacaoEl = document.getElementById("saudacao");
const relogioEl = document.getElementById("relogio");
const dataEl = document.getElementById("data");

function atualizarRelogio() {
    const agora = new Date();
    const hora = agora.getHours();

    let saudacao = "Boa noite!";
    if (hora < 12) {
        saudacao = "Bom dia!";
    } else if (hora < 18) {
        saudacao = "Boa tarde!";
    }

    saudacaoEl.textContent = saudacao;
    relogioEl.textContent = agora.toLocaleTimeString("pt-BR");
    dataEl.textContent = agora.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });
}

//
// FASE 6: Inicialização da Aplicação
//
// Ao carregar o script pela primeira vez, restaura os dados e o tema
// do localStorage e atualiza a interface gráfica.
carregarTema();
atualizarIconeTema();
carregarDoLocalStorage();
atualizarInterface();
atualizarRelogio();
setInterval(atualizarRelogio, 1000);