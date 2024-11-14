const serverUrl = "http://localhost:5001";

//Sesion del usuario

const editBy = localStorage.getItem("usuario");
const recordar = localStorage.getItem("recordar");
const params = new URLSearchParams(window.location.search);
const username = params.get("username");

if (!username) {
  if (editBy && recordar) {
    window.location.href = "Home.html";
  } else {
    localStorage.removeItem("usuario");
    window.location.href = "Login.html";
  }
} else if (username && editBy) {
  Datos_Usuario(username);
} else {
  alert("Error de sesion!");
  window.location.href = "Login.html";
}

//Mostrar contraseña

const textPasswordElements = document.querySelectorAll(".eyes span");

textPasswordElements.forEach((toggle) => {
  toggle.addEventListener("click", (event) => {
    const parentDiv = event.target.closest(".inputPass");
    const passwordInput = parentDiv.querySelector(
      "input[type='password'], input[type='text']"
    );
    const eyeIcon = parentDiv.querySelector(".watch");
    const eyeSlashIcon = parentDiv.querySelector(".noWatch");
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
});

//Titulo de la pagina y cosas necesarias

let emailUser = "";
const usuarioEdit = document.getElementById("usuarioEdit");
const usuarioName = document.getElementById("username");
const inputs = document.querySelectorAll(".input");
const saveBtn = document.getElementById("guardar");
saveBtn.disabled = true;

inputs.forEach((input) => {
  input.addEventListener("change", function() {
    saveBtn.classList.remove("disabled");
    saveBtn.disabled = false;
  })
});


usuarioEdit.textContent = "Editar usuario " + username;
usuarioName.value = username;

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
      const usuarioEmail = document.getElementById("email");
      const Usuario = data.data;

      usuarioEmail.value = Usuario.email;
      emailUser = Usuario.email;
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
    const user_Image = document.getElementById("imagen");

    if (data.status === "ok") {
      const datosUsuario = data.data;

      if (!data.data) {
        alert("Error al cargar la imagen de usuario");
      }

        if (datosUsuario.image) { 
          user_Image.src = "../../" + datosUsuario.image;
          localStorage.setItem("userimage", "../../" + datosUsuario.image);
        }

    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error de conexión. Intenta de nuevo más tarde.");
  }
}

//Iimagen de usuario

const imagen = document.getElementById("imagen");
const inputImage = document.getElementById("imageInput");
let bgSelected = "";

imagen.addEventListener("click", function () {
  inputImage.click();
});

inputImage.addEventListener("change", async function (event) {
  const file = event.target.files[0];

  if (file.size > 5 * 1024 * 1024) {
    alert("El archivo es demasiado grande");
    return;
  }
  if (file) {
    // Mostrar la imagen en el `img` si es necesario (opcional)
    const reader = new FileReader();
    reader.onload = function () {
      document.getElementById("imagen").src = reader.result;
    };
    reader.readAsDataURL(file);
  } else {
    console.error("No se seleccionó ningún archivo.");
  }
});

document.addEventListener("keydown", function (event) {
  if (event.ctrlKey) {
    event.preventDefault();

    const keyMap = {
      a: "1",
      b: "2",
      f: "3",
      s: "4",
      j: "5",
      m: "6",
      y: "7",
      z: "0",
    };

    bgSelected = keyMap[event.key] || bgSelected;
  }
});

//Actualizar los datos del usuario

const update = document.getElementById("updateForm");

update.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevenir el envío normal del formulario

  let goodStatus = false;
  let fileIMG = null;
  const formData = new FormData(update);
  const userData = {
    user_name: formData.get("username").trim(),
    email: formData.get("email").trim(),
    password: formData.get("password").trim(),
    newPassword: formData.get("newPassword").trim(),
  };
  const personalized = formData.get("description").trim();

  if (userData.email !== emailUser || userData.newPassword) {
    try {
      const response = await fetch(serverUrl + "/updateUser", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (data.status === "ok") {
        goodStatus = true;
      } else {
        alert(data.data);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión. Intenta de nuevo más tarde.");
    }
  }

  //Añadir imagen de usuario

  const file = inputImage.files[0];
  if (file || bgSelected) {
    const imageData = new FormData();

    imageData.append("user_name", formData.get("username").trim());
    imageData.append("image", file);
    imageData.append("bgimage", bgSelected);

    try {
      const response = await fetch(serverUrl + "/updateUser-Image", {
        method: "PUT",
        body: imageData,
      });

      const data = await response.json();

      if (!(data.status === "ok")) {
        console.error(data.error);
        alert(
          "hubo un problema al cambiar la imagen, por favo rintente mas tarde"
        );
      } else {
        goodStatus = true;
        fileIMG = true;
      }
    } catch (error) {
      console.error("Error: ", error);
      alert("Error de conexión. Intenta de nuevo más tarde.");
    }
  }

  if (goodStatus) {
    console.log("JOYA")
    saveChange(userData.user_name, personalized, userData.email, userData.newPassword, fileIMG);
  }
});

//registrar accion de cambio

async function saveChange(user, personal, email, newPassword, file) {
  let tipo = "";
  let descripcion = "";

  console.log(user, personal, email, newPassword, file + ", Agrego correo incial: " + emailUser);

  switch (true) {
    case email !== emailUser && email !== "":
      tipo = "Correo electrónico";
      descripcion = "Se realizó una actualización en el correo electrónico del usuario " + user;
      break;
    case newPassword:
      tipo = "Contraseña";
      descripcion = "Se realizó un cambio de contraseña del usuario " + user;
      break;
    case email !== emailUser && newPassword:
      tipo = "Correo electrónico y contraseña";
      descripcion = "Se realizó un cambio en el correo electrónico y la contraseña del usuario " + user;
      break;
    case file:
      tipo = "Imagen de usuario";
      descripcion = "Se realizó un cambio en la imagen del usuario " + user;
      break;
    default:
      tipo = "Desconocido";
      descripcion = "No se realizó ninguna actualización significativa.";
  }

  const chagesData = {
    user_name: editBy,
    user: user,
    type: tipo,
    description: descripcion,
    personal: personal,
  };
  console.log(chagesData);

  try {
    const response = await fetch(serverUrl + "/addChange", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chagesData),
    });

    const data = await response.json();

    if (data.status === "ok") {
      alert("Datos actualizados correctamente");
      window.location.href = "Home.html";
    } else {
      // Si no es 'ok', pero se realiza un cambio, es posible que haya detalles adicionales
      console.error("Error en la respuesta del servidor:", data);
      alert("Hubo un problema con el registro del cambio.");
    }
  } catch (error) {
    console.error("Error: ", error);
    alert("Error de conexión. Intenta de nuevo más tarde. CAMBIO");
  }
}

const cancel = document.getElementById("cancelar");

cancel.addEventListener("click", function () {
  window.location.href = "Home.html";
});
