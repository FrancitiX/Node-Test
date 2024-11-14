const serverUrl = "http://localhost:5001";

const User = document.getElementById("usuario");
const Email = document.getElementById("correo");
const Password = document.getElementById("contrasena");
const Exit = document.getElementById("salir");
const edit = document.getElementById("edit");

const usuario = localStorage.getItem("usuario");
const userImage = localStorage.getItem("userimage");

if (usuario) {
  Cargar_Usuarios(1);
  Cargar_Cambios(1);
  Datos_Usuario(usuario);
} else {
  alert("Error al iniciar sesion!");
  window.location.href = "Login.html";
}

if (userImage) {
  document.getElementById("imageUser").src = userImage;
}

edit.href = `Update.html?username=${encodeURIComponent(usuario)}`;

Exit.addEventListener("click", function () {
  localStorage.removeItem("usuario");
  window.location.href = "Login.html";
});

//Obtener los datos del usuario

async function Datos_Usuario(usuario) {
  const userData = {
    user_name: usuario.trim(),
  };

  try {
    const response = await fetch(serverUrl + "/userData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (data.status === "ok") {
      const Usuario = data.data;
      // console.log(data);

      if (!data.data) {
        localStorage.removeItem("usuario");
        window.location.href = "Login.html";
      }

      User.innerHTML = "Bienvenido " + Usuario.user_name;
      Email.innerHTML = "Correo: " + Usuario.email;
      Password.innerHTML = "Contraseña Hasheada: " + Usuario.pass;
    } else {
      alert("Hubo un error al iniciar sesión.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error de conexión. Intenta de nuevo más tarde.");
  }

  try {
    const response = await fetch(serverUrl + "/userImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    const user_Image = document.getElementById("imageUser");

    if (data.status === "ok") {
      const datosUsuario = data.data;

      if (!data.data) {
        alert("Error al cargar la imagen de usuario");
      }

      if (datosUsuario.image) {
        user_Image.src = "../../" + datosUsuario.image;
        localStorage.setItem("userimage", "../../" + datosUsuario.image);
      }
    } else {
      localStorage.removeItem("userimage");
      alert("Hubo un error al cargar la imagen.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error de conexión. Intenta de nuevo más tarde.");
  }
}

//Paginador

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
          <td class="noData" colspan="4">No hay usuarios registrados</td>
        `;
        tableUsers.appendChild(row);
      }

      users.reverse().forEach((usuario) => {
        const usersdata = `
                  <td id="userTable" class="campoTabla">${
                    usuario.user_name
                  }</td>
                  <td class="campoTabla">${usuario.email}</td>
                  <td class="campoTabla">
                  <a href="Update.html?username=${encodeURIComponent(
                    usuario.user_name
                  )}">Editar</a></td>
                  <td class="campoTabla"><a class="delete" data-username="${
                    usuario.user_name
                  }">Eliminar</a></td>
              `;
        tableUsers.insertAdjacentHTML("beforeend", usersdata);
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

      const deleteUser = document.querySelectorAll(".delete");
      deleteUser.forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          userTable = event.target.getAttribute("data-username").trim();
          showModal(userTable);
        });
      });
    })
    .catch((error) => {
      console.error("Error al realizar la solicitud:", error);
    });
}

//Modal de eliminacion

const modalContainer = document.getElementById("modalContainer");
const cancelButton = document.getElementById("cancelButton");
const deleteButton = document.getElementById("deleteButton");
let userTable;

function showModal(userName) {
  const userDeleteSpan = document.getElementById("userDelete");
  userDeleteSpan.textContent = userName; // Coloca el nombre del usuario a eliminar
  modalContainer.classList.remove("oculto"); // Muestra el modal
}

function hideModal() {
  modalContainer.classList.add("oculto");
}

cancelButton.addEventListener("click", hideModal);
deleteButton.addEventListener("click", () => {
  Eliminar_Usuario(userTable);
  hideModal(); // Oculta el modal después de eliminar
});

//Eliminar un usuario de la db

async function Eliminar_Usuario(usuarioDeleted) {
  const userData = {
    user_name: usuarioDeleted.trim(),
  };

  try {
    const response = await fetch(serverUrl + "/deleteUser", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (data.status === "ok") {
      Cargar_Usuarios(1);
      Cargar_Cambios(1);
      alert("Usuario eliminado correctamente");
    } else {
      alert("error: no se pudo eliminar el usuario");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error de conexión. Intenta de nuevo más tarde.");
  }

  const tipo = "Eliminacion de usuario";
  const descripcion =
    "Se elimino el usuario " +
    userData.user_name +
    " con el correo: " +
    userData.email;
  const personal = "";
  // console.log(usuario);

  const chagesData = {
    user_name: usuario.trim(),
    user: userData.user_name,
    type: tipo,
    description: descripcion,
    personal: personal,
  };

  try {
    const response = await fetch(serverUrl + "/addChange", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chagesData),
    });

    const data = await response.json();

    // if (data.status === "ok") {
    //   alert("Usuario creado exitosamente!");
    //   window.location.href = "Login.html";
    // } else if (data.status === "correo") {
    //   alert(data.data);
    // } else {
    //   alert("Hubo un error al registrar el usuario.");
    // }
  } catch (error) {
    console.error("Error:", error);
    alert("Error de conexión. Intenta de nuevo más tarde.");
  }
}

//Paginador de cmabios

const paginasContainerCH = document.getElementById("paginasCH");
const anteriorCh = document.getElementById("anteriorCH");
const siguienteCh = document.getElementById("siguienteCH");

let paginaCh = 1;
let maximoPaginasCh = 2;

siguienteCh.addEventListener("click", function () {
  if (paginaCh < maximoPaginasCh) {
    paginaCh++;
    Cargar_Cambios(paginaCh);
  }
});

anteriorCh.addEventListener("click", function () {
  if (paginaCh > 1) {
    paginaCh--;
    Cargar_Cambios(paginaCh);
  }
});

// Obtener todos los cambios de la db

async function Cargar_Cambios(N) {
  const skip = (N - 1) * 10;
  const url = `${serverUrl}/get-All-Changes?skip=${skip}`;

  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      const tableChanges = document.getElementById("chnagesTable");
      const totalPaginas = document.getElementById("totalPaginasCH");
      tableChanges.innerHTML = "";
      const changes = data.data || [];
      const paginas = data.pages.totalPages || 1;
      maximoPaginasCh = paginas;

      paginasContainerCH.textContent = "";

      if (maximoPaginasCh === 1) {
        const boton = document.createElement("button");
        boton.textContent = 1;
        boton.addEventListener("click", () => {
          paginaCh = 1;
          Cargar_Cambios(1);
        });
        paginasContainerCH.appendChild(boton);
      } else {
        for (let i = 1; i <= maximoPaginasCh; i++) {
          const boton = document.createElement("button");
          boton.textContent = i;
          boton.addEventListener("click", () => {
            paginaCh = i;
            Cargar_Cambios(i);
          });
          paginasContainerCH.appendChild(boton);
        }
      }

      if (changes.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="noData" colspan="5">No se han registrado cambios</td>
        `;
        tableChanges.appendChild(row);
      }

      changes.forEach((change) => {
        const changesdata = `
                  <td class="campoTabla">
                  <a href="Update.html?username6=${encodeURIComponent(
                    change.type
                  )}">${change.type}</a></td>
                  <td id="userTable" class="campoTabla">${
                    change.description
                  }</td>
                  <td class="campoTabla">${change.by}</td>
                  <td class="campoTabla">${change.date.date}</td>
                  <td class="campoTabla">${change.date.time}</td>
              `;
        tableChanges.insertAdjacentHTML("beforeend", changesdata);
      });

      siguienteCh.disabled = paginaCh >= maximoPaginasCh;
      anteriorCh.disabled = paginaCh <= 1;

      if (siguienteCh.disabled) {
        siguienteCh.classList.add("disabled");
      } else {
        siguienteCh.classList.remove("disabled");
      }
      if (anteriorCh.disabled) {
        anteriorCh.classList.add("disabled");
      } else {
        anteriorCh.classList.remove("disabled");
      }

      let resultados = data.pages.docs * paginaCh;

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

      const deleteUser = document.querySelectorAll(".delete");
      deleteUser.forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          userTable = event.target.getAttribute("data-username").trim();
          showModal(userTable);
        });
      });
    })
    .catch((error) => {
      console.error("Error al realizar la solicitud:", error);
    });
}
