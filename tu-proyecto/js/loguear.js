const serverUrl = "https://francitix.github.io/Node-Test/";

const usuario = localStorage.getItem("usuario");
const recordar = localStorage.getItem("recordar");

if (usuario && recordar) {
  window.location.href = "Home.html";
} else {
  localStorage.removeItem("usuario");
}

//Input de contraseña

const passwordInput = document.getElementById("password");
const textPassword = document.getElementById("eyes");
const eyeIcon = document.getElementById("watch");
const eyeSlashIcon = document.getElementById("noWatch");

textPassword.addEventListener("click", () => {
  const isHidden = eyeIcon.classList.contains("oculto");

  if (!isHidden) {
    passwordInput.type = "text";
    eyeIcon.classList.add("oculto");
    eyeSlashIcon.classList.remove("oculto");
  } else {
    passwordInput.type = "password";
    eyeIcon.classList.remove("oculto");
    eyeSlashIcon.classList.add("oculto");
  }
});

//Funcion de cargar usuarios
Cargar_Usuarios(1);

// Inicar sesion

const login = document.getElementById("loginForm");
const rememberme = document.getElementById('recordarme');

login.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevenir el envío normal del formulario

  const formData = new FormData(login);
  const userData = {
    user: formData.get("username").trim(),
    password: formData.get("password").trim(),
  };

  try {
    const response = await fetch(serverUrl + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (data.status === "ok") {
      if (rememberme.checked) {
        localStorage.setItem("usuario", data.usuario);
        localStorage.setItem("recordar", true);
        window.location.href = "Home.html";
      } else {
        localStorage.setItem("usuario", data.usuario);
        window.location.href = "Home.html";
      }
      
    } else {
      alert(data.data);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error de conexión. Intenta de nuevo más tarde.");
  }
});

// Hacer la solicitud POST al servidor

const paginasContainerUS = document.getElementById("paginasUS");
const anteriorUS = document.getElementById("anteriorUS");
const siguienteUS = document.getElementById("siguienteUS");

let pagina = 1;
let maximoPaginas = 2;

siguienteUS.addEventListener("click", function () {
  if (pagina < maximoPaginas) {
    pagina++;
    Cargar_Usuarios(pagina);
  }
});

anteriorUS.addEventListener("click", function () {
  if (pagina > 1) {
    pagina--;
    Cargar_Usuarios(pagina);
  }
});

// Obtener todos los usuarios de la db

async function Cargar_Usuarios(N) {
  const skip = (N - 1) * 10;
  const url = `${serverUrl}/get-All-User?skip=${skip}`;

  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      // console.log('Response received:', response);
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      const tableUsers = document.getElementById("usersTable");
      const totalPaginas = document.getElementById("totalPaginas");
      tableUsers.innerHTML = "";
      const users = data.data || [];
      const paginas = data.pages.totalPages || 1;
      maximoPaginas = paginas;

      paginasContainerUS.textContent = "";

      if (maximoPaginas === 1) {
        const boton = document.createElement("button");
        boton.textContent = 1;
        boton.addEventListener("click", () => {
          pagina = 1;
          Cargar_Usuarios(1);
        });
        paginasContainerUS.appendChild(boton);
      } else {
        for (let i = 1; i <= maximoPaginas; i++) {
          const boton = document.createElement("button");
          boton.textContent = i;
          boton.addEventListener("click", () => {
            pagina = i;
            Cargar_Usuarios(i);
          });
          paginasContainerUS.appendChild(boton);
        }
      }

      if (users.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="noData" colspan="2">No hay usuarios registrados</td>
        `;
        tableUsers.appendChild(row);
      }

      users.reverse().forEach((usuario) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="campoTabla">${usuario.user_name}</td>
          <td class="campoTabla">${usuario.email}</td>
        `;
        tableUsers.appendChild(row);
      });

      siguienteUS.disabled = pagina >= maximoPaginas;
      anteriorUS.disabled = pagina <= 1;

      if (siguienteUS.disabled) {
        siguienteUS.classList.add("disabled");
      } else {
        siguienteUS.classList.remove("disabled");
      }
      if (anteriorUS.disabled) {
        anteriorUS.classList.add("disabled");
      } else {
        anteriorUS.classList.remove("disabled");
      }

      let resultados = data.pages.docs * pagina;

      if (!(resultados % 10 === 0)) {
        resultados = data.pages.totalDocs;
      }

      totalPaginas.textContent =
        "Mostrando " +
        (skip + 1) +
        " - " +
        resultados +
        " resultados de " +
        data.pages.totalDocs;
    })
    .catch((error) => {
      console.error("Error al realizar la solicitud:", error);
    });
}
