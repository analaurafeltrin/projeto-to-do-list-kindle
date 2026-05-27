// Persistência

function getBooks() {
  // localStorage só guarda texto, então JSON.parse converte a string de volta pra array.
  return JSON.parse(localStorage.getItem('myBooks') || '[]'); // se ainda não houver nada salvo, getItem retorna null — o '|| []' evita erro
}

function saveBooks(books) {
  localStorage.setItem('myBooks', JSON.stringify(books)); // JSON.stringify converte o array em string antes de salvar
}

// ─── Inicialização

window.onload = renderList; // assim que o navegador terminar de carregar a página, chama renderList automaticamente

// ─── Adicionar livro

function popup(event) {
  if (event) event.preventDefault(); // impede que o formulário recarregue a página

  const inputBook = document.getElementById('book'); // pega o campo de texto pelo id 'book' e lê o que o usuário digitou
  const bookName = inputBook.value.trim(); // .trim() remove espaços nas pontas, impede registrar livro digitando só espaços

  if (bookName === '') {
    alert('Por favor, digite o nome do livro.');
    return; // se depois do trim ainda estiver vazio, avisa e sai da função
  }

  const newBook = {
    id: crypto.randomUUID(), // crypto.randomUUID() gera um id único garantido, ex: "a3f2c1d0-..." é isso que identifica o livro, mesmo que outro tenha o mesmo nome
    name: bookName,
    lido: false,
    nota: 0,
  };

  const books = getBooks();
  books.push(newBook);
  saveBooks(books); // lê a lista atual, adiciona o novo livro no final, salva tudo de volta

  renderList(); //
  displaySuccessMessage(bookName);
  inputBook.value = ''; // redesenha a lista, mostra mensagem de sucesso, limpa o campo de texto
}

// ─── Mensagem de sucesso

function displaySuccessMessage(name) {
  const warn = document.createElement('div'); // cria uma div na memória e define o texto dela
  warn.innerText = `O livro "${name}" foi registrado com sucesso!`;
  warn.classList.add('popup-warn');
  document.body.appendChild(warn); // adiciona a classe CSS que estiliza o aviso e insere a div no body

  setTimeout(() => warn.classList.add('show'), 50); // atraso para o navegador "ver" a div antes de aplicar a animação de aparecer

  setTimeout(() => {
    warn.classList.remove('show');
    setTimeout(() => warn.remove(), 500);
  }, 3000); // remove a classe 'show' (some a div com animação)
}

// ─── Renderizar livro na tela

function displayBookScreen(bookObj) {
  const list = document.getElementById('booksList');
  const item = document.createElement('li'); // acha a lista onde os livros aparecem e cria um item <li> pra esse livro

  // monta o HTML do livro
  // escapeHtml protege contra XSS. se o nome tiver <script>, não vai executar
  item.innerHTML = `
    <div class="col-nome">${escapeHtml(bookObj.name)}</div> 
    <div class="col-lido">
      <input class="checkbox" type="checkbox" ${bookObj.lido ? 'checked' : ''}>
    </div>
    <div class="col-avaliacao">
      <span class="estrelas">
        <span class="star ${bookObj.nota === 5 ? 'ativa' : ''}" data-valor="5">★</span>
        <span class="star ${bookObj.nota === 4 ? 'ativa' : ''}" data-valor="4">★</span>
        <span class="star ${bookObj.nota === 3 ? 'ativa' : ''}" data-valor="3">★</span>
        <span class="star ${bookObj.nota === 2 ? 'ativa' : ''}" data-valor="2">★</span>
        <span class="star ${bookObj.nota === 1 ? 'ativa' : ''}" data-valor="1">★</span>
      </span>
    </div>
    <div class="col-acoes">
      <button class="remove-button">Remover</button>
    </div>
  `;

  // addEventListener em vez de onclick inline — não quebra se o nome tiver aspas ou caracteres especiais
  item.querySelector('.checkbox').addEventListener('change', function () {
    updateStatus(bookObj.id, 'lido', this.checked);
  });

  item.querySelectorAll('.star').forEach(star => {
    //percorre todas as estrelas e adiciona o evento de clique em cada uma
    star.addEventListener('click', function () {
      const nota = Number(this.dataset.valor);
      updateStatus(bookObj.id, 'nota', nota); // salva no localStorage
      setRating(item, nota); // atualiza visualmente
    });
  });

  item.querySelector('.remove-button').addEventListener('click', () => {
    removeBook(bookObj.id); // passa o id (não o nome) pro removeBook. evita o bug de livros com nome igual
  });

  list.appendChild(item); // só adiciona o item à lista depois que todos os eventos já estão configurados
}

// ─── Atualizar estrelas visualmente

function setRating(item, nota) {
  item.querySelectorAll('.star').forEach(star => {
    star.classList.toggle('ativa', Number(star.dataset.valor) === nota);
  }); // // toggle com condição: adiciona 'ativa' se o valor da estrela bate com a nota, remove se não bate.
  // mais limpo que fazer forEach + classList.remove + classList.add separados
}

// ─── Atualizar campo no localStorage

function updateStatus(id, campo, valor) {
  if (campo === 'lido') valor = Boolean(valor);
  if (campo === 'nota') valor = Number(valor); // // garante o tipo correto antes de salvar. o localStorage não diferencia tipos sozinho

  const books = getBooks().map(book =>
    book.id === id ? { ...book, [campo]: valor } : book
  ); // percorre todos os livros. se o id bater, retorna um objeto novo com o campo atualizado. se não bater, retorna o livro sem mudança

  saveBooks(books);
}

// ─── Remover livro

function removeBook(id) {
  saveBooks(getBooks().filter(book => book.id !== id));
  renderList(); // filter mantém só os livros cujo id é DIFERENTE do que queremos apagar
}

// ─── Renderizar lista completa

function renderList() {
  const list = document.getElementById('booksList');
  list.innerHTML = '';
  getBooks().forEach(book => displayBookScreen(book));
} // para cada livro salvo, chama displayBookScreen que cria e insere o <li> na lista

// ─── Utilitário: escapar HTML para evitar XSS

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
} // substitui caracteres especiais pelas versões seguras em HTML
// sem isso, um nome como <script>alert('x')</script> seria executado como código
