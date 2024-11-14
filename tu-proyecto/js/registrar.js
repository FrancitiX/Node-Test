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


//Validar nombre de usuario

const userInput = document.getElementById("username");
const registrarInput = document.getElementById("registrar");
const Status = document.getElementById("estatusDisponible");

userInput.addEventListener("focusout", async () => {

  const userData = {
    user_name: userInput.value.trim(),
  };

  try {
    const response = await fetch(serverUrl + "/user-aval", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (data) {
      console.log(data.data)
      if (data.status === "Ocupado") {
        registrarInput.disabled = true;
        Status.innerHTML = "Ocupado";
        Status.classList.remove("disponible");
        Status.classList.add("ocupado");
      } else {
        registrarInput.disabled = false;
        Status.innerHTML = "Disponible";
        Status.classList.remove("ocupado");
        Status.classList.add("disponible");
      }

    } else {
      alert("Caracoles! parece que quien revisa los nombre de usuario esta dormido");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error de conexión. Intenta de nuevo más tarde.");
  }
});

// Registrar

const sing = document.getElementById("registerForm");

sing.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevenir el envío normal del formulario

  const formData = new FormData(sing);
  const userData = {
    user_name: formData.get("username").trim(),
    email: formData.get("email").trim(),
    password: formData.get("password").trim(),
  };

  try {
    const response = await fetch(serverUrl + "/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (data.status === "ok") {
      alert("Usuario creado exitosamente!");
      window.location.href = "Login.html";
    } else if (data.status === "correo") {
      alert(data.data);
    } else {
      alert("Hubo un error al registrar el usuario.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error de conexión. Intenta de nuevo más tarde.");
  }

  const tipo = "Registro de usuario";
  const descripcion = "Se registro el usuario " + userData.user_name + " con el correo: " + userData.email;
  const personal = "";

  const chagesData = {
    user_name: userData.user_name,
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
});

