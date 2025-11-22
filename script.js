// Elementos
const form = document.getElementById("form-gasto");
const lista = document.getElementById("lista-gastos");
const totalSpan = document.getElementById("total");
const categoriaSelect = document.getElementById("categoria");
const categoriaOutros = document.getElementById("categoria-outros");
const mesFiltro = document.getElementById("mes-filtro");
const anoFiltro = document.getElementById("ano-filtro");
const botaoFiltrar = document.getElementById("filtrar");
const entradaInput = document.getElementById("entrada");
const origemInput = document.getElementById("origem");
const editarEntradaBtn = document.getElementById("editar-entrada");
const salvarEntradaBtn = document.getElementById("salvar-entrada");
const mensagemNegativo = document.getElementById("mensagem-negativo");

let gastos = JSON.parse(localStorage.getItem("gastos")) || [];
let entrada = 0;
let origem = "";
let grafico;

// -------------------------
// Carregar entrada e origem do localStorage
// -------------------------
window.addEventListener("load", () => {
  const entradaSalva = localStorage.getItem("entrada");
  const origemSalva = localStorage.getItem("origem");

  if (entradaSalva) {
    entrada = Number(entradaSalva);
    entradaInput.value = entrada;
    entradaInput.disabled = true;
  }

  if (origemSalva) {
    origem = origemSalva;
    origemInput.value = origem;
    origemInput.disabled = true;
  }

  atualizarLista();
});

// -------------------------
// Entrada fixa e edição
// -------------------------
editarEntradaBtn.addEventListener("click", () => {
  entradaInput.disabled = false;
  origemInput.disabled = false;
  salvarEntradaBtn.style.display = "inline";
  editarEntradaBtn.style.display = "none";
});

salvarEntradaBtn.addEventListener("click", () => {
  entrada = Number(entradaInput.value) || 0;
  origem = origemInput.value || "";

  // Salvar no localStorage
  localStorage.setItem("entrada", entrada);
  localStorage.setItem("origem", origem);

  entradaInput.disabled = true;
  origemInput.disabled = true;
  salvarEntradaBtn.style.display = "none";
  editarEntradaBtn.style.display = "inline";

  atualizarLista();
});

// -------------------------
// Categoria "Outros"
// -------------------------
categoriaSelect.addEventListener("change", () => {
  categoriaOutros.style.display = categoriaSelect.value === "Outros" ? "block" : "none";
});

// -------------------------
// Botão Filtrar
// -------------------------
botaoFiltrar.addEventListener("click", () => {
  atualizarLista();
});

// -------------------------
// Atualizar lista e saldo
// -------------------------
function atualizarLista() {
  lista.innerHTML = "";
  let total = 0;

  const mesSelecionado = mesFiltro.value;
  const anoSelecionado = anoFiltro.value;

  const gastosFiltrados = gastos.filter(g => {
    const [ano, mes] = g.data.split("-");
    const condMes = mesSelecionado ? mes === mesSelecionado : true;
    const condAno = anoSelecionado ? ano === anoSelecionado : true;
    return condMes && condAno;
  });

  gastosFiltrados.forEach((gasto, index) => {
    const li = document.createElement("li");
    li.id = "gasto-item";
    li.title = gasto.descricao; // Tooltip

    li.innerHTML = `
      <span>${gasto.data} - ${gasto.categoria}: R$ ${gasto.valor.toFixed(2)}</span>
      <button class="apagar" onclick="removerGasto(${index})">🗑️</button>
    `;
    lista.appendChild(li);
    total += gasto.valor;
  });

  totalSpan.textContent = total.toFixed(2);

  // Mensagem saldo negativo
  const saldo = entrada - total;
  if (saldo < 0) {
    mensagemNegativo.textContent = `⚠️ Saldo negativo: R$ ${Math.abs(saldo).toFixed(2)}`;
  } else {
    mensagemNegativo.textContent = "";
  }

  atualizarGrafico(gastosFiltrados);
  localStorage.setItem("gastos", JSON.stringify(gastos));
}

// -------------------------
// Adicionar gasto
// -------------------------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const descricao = document.getElementById("descricao").value;
  const categoria = categoriaSelect.value === "Outros" ? categoriaOutros.value : categoriaSelect.value;
  const valor = parseFloat(document.getElementById("valor").value);
  const data = document.getElementById("data").value;

  if (!descricao || !categoria || isNaN(valor) || !data) {
    alert("Preencha todos os campos corretamente!");
    return;
  }

  gastos.push({ descricao, categoria, valor, data });
  atualizarLista();
  form.reset();
  categoriaOutros.style.display = "none";
});

// -------------------------
// Remover gasto
// -------------------------
function removerGasto(index) {
  gastos.splice(index, 1);
  atualizarLista();
}

// -------------------------
// Gráfico
// -------------------------
function atualizarGrafico(filtroGastos = gastos) {
  const categorias = {};
  filtroGastos.forEach(gasto => {
    categorias[gasto.categoria] = (categorias[gasto.categoria] || 0) + gasto.valor;
  });

  const ctx = document.getElementById("graficoGastos").getContext("2d");

  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(categorias),
      datasets: [{
        data: Object.values(categorias),
        backgroundColor: [
          '#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff', '#ff9f40'
        ],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
      }
    }
  });
}

// -------------------------
// Inicializa lista e gráfico
// -------------------------
atualizarLista();
