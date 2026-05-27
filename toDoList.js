// Quando a página termina de carregar, executa a função que desenha a lista na tela
window.onload = renderList;

function popup(event) {
  // 1. Evita que a página recarregue se a função for chamada por um formulário ou botão
  if (event) event.preventDefault();

  // 2. Captura o campo de texto e o valor digitado (nome do livro)
  const inputBook = document.getElementById("book");
  const bookName = inputBook.value;

  // 3. Validação: se estiver vazio ou apenas espaços, avisa o usuário e para aqui
  if (bookName.trim() === "") {
    alert("Por favor, digite o nome do livro.");
    return;
  }

  // 4. Puxa os livros já salvos no navegador ou cria um array vazio se não houver nenhum
  const books = JSON.parse(localStorage.getItem("myBooks") || "[]");

  // 5. Cria o objeto do novo livro com valores padrão (não lido e nota zero)
  const newBook = {
    name: bookName,
    lido: false,
    nota: 0,
  };

  // 6. Adiciona o novo livro na lista e salva tudo de volta no localStorage (banco de dados do navegador)
  books.push(newBook);
  localStorage.setItem("myBooks", JSON.stringify(books));

  // 7. Atualiza a lista visual, mostra mensagem de sucesso e limpa o campo de digitação
  renderList();
  displaySucessMessage(bookName);
  inputBook.value = "";
}

function displaySucessMessage(name) {
  // 1. Cria um novo elemento DIV na memória
  const warn = document.createElement("div");
  warn.innerText = `O livro "${name}" foi registrado com sucesso!`;
  warn.classList.add("popup-warn");

  // 2. Coloca essa DIV dentro do corpo (body) do seu site
  document.body.appendChild(warn);

  // 3. Pequeno atraso para o navegador perceber a DIV e aplicar a animação de "aparecer"
  setTimeout(() => {
    warn.classList.add("show");
  }, 50);

  // 4. Após 3 segundos, remove a classe de visibilidade e depois deleta o elemento do HTML
  setTimeout(() => {
    warn.classList.remove("show");
    setTimeout(() => warn.remove(), 50);
  }, 3000);
}

function displayBookScreen(bookObj) {
  // 1. Acha a lista (UL ou DIV) onde os livros devem aparecer
  const list = document.getElementById("booksList");

  // 2. Cria um item de lista (LI)
  const item = document.createElement("li");

  // 3. Função interna que checa se a nota do livro é igual à estrela que está sendo desenhada
  const checkAtiva = (valor) => (bookObj.nota == valor ? "ativa" : "");

  // 4. Monta o HTML interno com o nome, checkbox de lido, estrelas e o botão remover
  item.innerHTML = `
  <div class="col-nome">${bookObj.name}</div>
  <div class="col-lido">
    <input class="checkbox" type="checkbox" ${bookObj.lido ? "checked" : ""}
    onchange="updateStatus('${bookObj.name}', 'lido', this.checked)">
  </div>
  <div class="col-avaliacao">
    <span class="estrelas" data-book="${bookObj.name}">
      <span class="star ${checkAtiva(5)}" onclick="setRating('${bookObj.name}', 5, this)">★</span>
      <span class="star ${checkAtiva(4)}" onclick="setRating('${bookObj.name}', 4, this)">★</span>
      <span class="star ${checkAtiva(3)}" onclick="setRating('${bookObj.name}', 3, this)">★</span>
      <span class="star ${checkAtiva(2)}" onclick="setRating('${bookObj.name}', 2, this)">★</span>
      <span class="star ${checkAtiva(1)}" onclick="setRating('${bookObj.name}', 1, this)">★</span>
    </span>
  </div>
  <div class="col-acoes">
    <button class="remove-button" onclick="removeBook('${bookObj.name}')">Remover</button>
  </div>
    `;

  // 5. Adiciona o item pronto à lista na tela
  list.appendChild(item);
}

function setRating(bookName, nota, elementoClicado) {
  // 1. Atualiza seu banco de dados
  updateStatus(bookName, "nota", nota);

  // 2. Acha o container pai (a div .estrelas)
  const container = elementoClicado.parentElement;

  // 3. Limpa a classe 'ativa' de todas as estrelas DAQUELE livro
  const irmas = container.querySelectorAll(".star");
  irmas.forEach((s) => s.classList.remove("ativa"));

  // 4. Força a classe ativa na estrela que você acabou de clicar
  elementoClicado.classList.add("ativa");

  console.log("Classe ativa adicionada a:", elementoClicado);
}

function updateStatus(bookName, campo, valor) {
  // 1. Pega os dados atuais do localStorage
  let books = JSON.parse(localStorage.getItem("myBooks") || "[]");

  // 2. Se estivermos mudando o status 'lido', garante que o valor seja verdadeiro ou falso
  if (campo === "lido") valor = Boolean(valor);

  // 3. Mapeia a lista: se achar o livro pelo nome, atualiza o campo específico (nota ou lido)
  books = books.map((book) => {
    if (book.name === bookName) {
      book[campo] = valor;
    }
    return book;
  });

  // 4. Salva a lista atualizada de volta no armazenamento
  localStorage.setItem("myBooks", JSON.stringify(books));
}

function removeBook(name) {
  // 1. Pega a lista atual
  let books = JSON.parse(localStorage.getItem("myBooks") || "[]");

  // 2. Filtra a lista, mantendo apenas os livros que TÊM NOME DIFERENTE do que você quer apagar
  books = books.filter((book) => {
    const bookName = typeof book === "object" ? book.name : book;
    return bookName !== name;
  });

  // 3. Salva a nova lista (sem o livro removido) e redesenha a tela
  localStorage.setItem("myBooks", JSON.stringify(books));
  renderList();
}

function renderList() {
  // 1. Limpa tudo o que está aparecendo na lista agora para não duplicar
  const list = document.getElementById("booksList");
  list.innerHTML = "";

  // 2. Pega os livros do armazenamento e, para cada um, chama a função de desenhar na tela
  const books = JSON.parse(localStorage.getItem("myBooks") || "[]");
  books.forEach((book) => displayBookScreen(book));
}
