const searchInput = document.getElementById("nav_search");
const searchIcon = document.getElementById("search-btn");
const main = document.querySelector("main");
const mainChildren = [];

for (const c of main.children) {
    mainChildren.push(c.cloneNode(true));
}

searchIcon?.addEventListener("click", search);
searchInput?.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        search();
        return;
    }

    debounce((ev) => {
        search();
    }, 250)();
});

function search() {
    if (!searchInput) return;

    main.innerHTML = "";

    if (searchInput.value === "") {
        for (const c of mainChildren) {
            main.appendChild(c);
        }
        return;
    }

    for (const c of mainChildren) {
        if (
            c.innerHTML.toLowerCase().includes(searchInput.value.toLowerCase())
        ) {
            main.appendChild(c);
        }
    }
}

function debounce(callback, wait) {
    let timeoutId = null;
    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
            callback.apply(null, args);
        }, wait);
    };
}

const btnEntrar = document.getElementById("btn-entrar");
const entrarError = document.getElementById("entrar-error");
const btnCadastrar = document.getElementById("btn-cadastrar");
const cadastrarError = document.getElementById("cadastrar-error");

btnEntrar?.addEventListener("click", entrar);
btnCadastrar?.addEventListener("click", cadastrar);

function cadastrar(e) {
    e.preventDefault();

    if (!cadastrarError) return;

    cadastrarError.innerHTML = "";

    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const senha = document.getElementById("senha");

    if (!username || username.value === "") {
        cadastrarError.innerHTML = "O username é obrigatório";
        return;
    }

    if (!email || email.value === "") {
        cadastrarError.innerHTML = "O email é obrigatório";
        return;
    }

    if (!validateEmail(email.value)) {
        cadastrarError.innerHTML = "O email precisa ser válido";
        return;
    }

    if (!senha || senha.value === "") {
        cadastrarError.innerHTML = "A senha é obrigatória";
        return;
    }

    if (senha.value.length < 8) {
        cadastrarError.innerHTML = "A senha precisa ter ao menos 8 caracteres";
        return;
    }

    makeRequest(email.value, senha.value, username.value, cadastrarError);
}

function entrar(e) {
    e.preventDefault();

    if (!entrarError) return;

    entrarError.innerHTML = "";

    const email = document.getElementById("entreEmail");
    const senha = document.getElementById("entreSenha");

    if (!email || email.value === "") {
        entrarError.innerHTML = "O email é obrigatório";
        return;
    }

    if (!validateEmail(email.value)) {
        entrarError.innerHTML = "O email precisa ser válido";
        return;
    }

    if (!senha || senha.value === "") {
        entrarError.innerHTML = "A senha é obrigatório";
        return;
    }

    makeRequest(email.value, senha.value, "", entrarError);
}

function makeRequest(email, senha, username, pError) {
    const endpoint = "http://localhost/api/in";

    let body = {
        email: email,
        password: senha,
    };
    if (username && username !== "") {
        body.username = username;
    }

    fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })
        .then(async (response) => {
            if (response.ok) {
                return response.json();
            }

            const resData = await response.json();
            const error = resData["error"];
            if (!error) return;

            if (error === "User creation failed") {
                pError.innerHTML = "Nome de usuário ou email já cadastrados";
            } else if (error === "unauthorized") {
                pError.innerHTML = "Senha incorreta ou usuário não encontrado";
            } else {
                pError.innerHTML = error;
            }
        })
        .then(async (data) => {
            if (!data) return;

            if (data["message"] === "User created successfully") {
                pError.innerHTML = "Usuário criado com sucesso";
            } else {
                pError.innerHTML = "Você entrou!";
            }
        })
        .catch((error) => {
            console.error("error", error);
        });
}

function validateEmail(email) {
    var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return email.match(emailPattern);
}
