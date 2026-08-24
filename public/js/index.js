
const URL_API = "http://localhost:10000";

function abrirModal() {
    document.getElementById('modal-autenticacao').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modal-autenticacao').style.display = 'none';
}

function mudarAba(tipo) {
    const loginForm = document.getElementById('formulario-login');
    const cadastroForm = document.getElementById('formulario-cadastro');
    const abaLogin = document.getElementById('aba-login');
    const abaCadastro = document.getElementById('aba-cadastro');

    if (tipo === 'login') {
        loginForm.style.display = 'flex';
        cadastroForm.style.display = 'none';
        abaLogin.classList.add('ativa');
        abaCadastro.classList.remove('ativa');
    } else {
        loginForm.style.display = 'none';
        cadastroForm.style.display = 'flex';
        abaLogin.classList.remove('ativa');
        abaCadastro.classList.add('ativa');
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('modal-autenticacao');
    if (event.target == modal) fecharModal();
}


document.getElementById('print').addEventListener('change', function() {
    const nomeArquivo = this.files[0] ? this.files[0].name : "Nenhum arquivo selecionado";
    document.getElementById('nome-arquivo').textContent = "Arquivo selecionado: " + nomeArquivo;
});



// LOGIN
document.getElementById('formulario-login').onsubmit = async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email-login').value;
    const senha = document.getElementById('senha-login').value;
    const botao = e.target.querySelector('button');

    try {
        botao.innerText = "Autenticando...";
        botao.disabled = true;

        const resposta = await fetch(`${URL_API}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            localStorage.setItem('guardix_token', dados.token);
            localStorage.setItem('usuario_nome', dados.nome || email.split('@')[0]);
            
            window.location.href = "/guardix.html";
        } else {
            alert(dados.error || "Erro ao realizar login.");
        }

    } catch (erro) {
        alert("Erro de conexão com o servidor.");
    } finally {
        botao.innerText = "Entrar na Conta";
        botao.disabled = false;
    }
};

// 2. CADASTRO
document.getElementById('formulario-cadastro').onsubmit = async function(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nome-cadastro').value;
    const email = document.getElementById('email-cadastro').value;
    const senha = document.getElementById('senha-cadastro').value;
    const botao = e.target.querySelector('button');

    try {
        botao.innerText = "Criando Conta...";
        botao.disabled = true;

        const resposta = await fetch(`${URL_API}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            alert("Conta criada com sucesso! Faça seu login.");
            mudarAba('login');
        } else {
            alert(dados.error || "Erro ao criar conta.");
        }

    } catch (erro) {
        alert("Erro de conexão com o servidor.");
    } finally {
        botao.innerText = "Criar Minha Conta";
        botao.disabled = false;
    }
};

document.getElementById('formulario-analise').onsubmit = async function(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('guardix_token');
    if (!token) {
        alert("Para realizar uma análise detalhada, por favor, entre na sua conta.");
        abrirModal();
        return;
    }

    const urlValue = document.getElementById('url').value;
    const telValue = document.getElementById('telefone').value;
    const fileFile = document.getElementById('print').files[0];

    window.location.href = "guardix.html";
};