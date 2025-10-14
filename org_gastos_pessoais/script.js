const form = document.getElementById("form-gasto");
const lista = document.getElementById("lista-gastos");
const totalSpan = document.getElementById("total");
const categoriaSelect = document.getElementById("categoria");
const categoriaOutros = document.getElementById("categoria-outros");

const mesFiltro = document.getElementById("mes-filtro");
const anoFiltro = document.getElementById("ano-filtro");
const botaoFiltrar = document.getElementById("filtrar");

let gastos = JSON.parse(localStorage.getItem("gastos")) || [];
let grafico;

// Mostrar campo "Outros"
categoriaSelect.addEventListener("change", () => {
  categoriaOutros.style.display = categoriaSelect.value === "Outros" ? "block" : "none";
});

// Botão de filtro
botaoFiltrar.addEventListener("click", () => {
  atualizarLista();
});

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
    li.innerHTML = `
      <span>${gasto.data} - ${gasto.categoria}: R$ ${gasto.valor.toFixed(2)}</span>
      <button class="apagar" onclick="removerGasto(${index})">🗑️</button>
    `;
    lista.appendChild(li);
    total += gasto.valor;
  });

  totalSpan.textContent = total.toFixed(2);

  atualizarGrafico(gastosFiltrados);
  localStorage.setItem("gastos", JSON.stringify(gastos));
}

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

function removerGasto(index) {
  gastos.splice(index, 1);
  atualizarLista();
}

function atualizarGrafico(filtroGastos = gastos) {
  const categorias = {};
  filtroGastos.forEach(gasto => {
    categorias[gasto.categoria] = (categorias[gasto.categoria] || 0) + gasto.valor;
  });

  const ctx = document.getElementById("graficoGastos").getContext("2d");

  if (grafico) grafico.destroy(); // evita gráfico duplicado

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

// Inicializa lista e gráfico
atualizarLista();
