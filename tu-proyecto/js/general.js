const serverURL = "https://francitix.github.io/Node-Test/";

//Tema

const tema = localStorage.getItem("tema");
const light = document.getElementById("Light");
const dark = document.getElementById("Dark");

if (tema === "dark") {
  light.classList.add("oculto");
  dark.classList.remove("oculto");
} else {
  light.classList.remove("oculto");
  dark.classList.add("oculto");
}

if (tema) {
  theme(tema);
}

light.addEventListener("click", function () {
  light.classList.add("oculto");
  dark.classList.remove("oculto");
  theme("dark");
});

dark.addEventListener("click", function () {
  light.classList.remove("oculto");
  dark.classList.add("oculto");
  theme("light");
});

function theme(theme) {
  const root = document.documentElement;
  if (theme === "light") {
    localStorage.setItem("tema", "light");
    root.style.setProperty("--bgColor", "rgb(240, 242, 245)");
    root.style.setProperty("--bgColor2", "rgb(235, 238, 240)");
    root.style.setProperty("--text", "rgb(20, 20, 20)");
    root.style.setProperty("--text", "rgb(20, 20, 20)");
    root.style.setProperty("--detail", "rgba(10, 10, 10, 0.2)");
    root.style.setProperty("--detail2", "rgba(130, 130, 130)");
    root.style.setProperty("--detail3", "rgb(220, 225, 230)");
  } else {
    localStorage.setItem("tema", "dark");
    root.style.setProperty("--bgColor", "rgb(20, 22, 23)");
    root.style.setProperty("--bgColor2", "rgb(30, 33, 35)");
    root.style.setProperty("--text", "rgb(240, 240, 240)");
    root.style.setProperty("--text2", "rgb(240, 240, 240)");
    root.style.setProperty("--detail", "rgba(200, 200, 200, 0.2)");
    root.style.setProperty("--detail2", "rgba(170, 170, 170)");
    root.style.setProperty("--detail3", "rgba(70, 70, 70)");
  }
}

const bg = document.getElementById("bg");

document.addEventListener("keydown", function (event) {
  if (event.ctrlKey) {
    event.preventDefault();

    switch (event.key) {
      case "a":
        bg.classList.remove("bg2", "bg3", "bg4", "bg5", "bg6", "bg7");
        bg.classList.add("bg1");
        break;
      case "b":
        bg.classList.remove("bg1", "bg3", "bg4", "bg5", "bg6", "bg7");
        bg.classList.add("bg2");
        break;
      case "f":
        bg.classList.remove("bg1", "bg2", "bg4", "bg5", "bg6", "bg7");
        bg.classList.add("bg3");
        break;
      case "s":
        bg.classList.remove("bg1", "bg2", "bg3", "bg5", "bg6", "bg7");
        bg.classList.add("bg4");
        break;
      case "j":
        bg.classList.remove("bg1", "bg2", "bg3", "bg4", "bg6", "bg7");
        bg.classList.add("bg5");
        break;
      case "m":
        bg.classList.remove("bg1", "bg2", "bg3", "bg4", "bg5", "bg7");
        bg.classList.add("bg6");
        break;
      case "y":
        bg.classList.remove("bg1", "bg2", "bg3", "bg4", "bg5", "bg6");
        bg.classList.add("bg7");
        break;
      case "z":
        bg.classList.remove("bg1", "bg2", "bg3", "bg4", "bg5", "bg6", "bg7");
        break;

      default:
        break;
    }
  }
});

//Comparacion de la base de datos

const alerta = document.getElementById("alerta");

Comparacion();

async function Comparacion() {
  const url = serverURL + "/CompareDB";

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
      if (!(data.status === "ok")) {
        alert(data.data);
        alerta.classList.remove("oculto");
      }
    })
    .catch((error) => {
      console.error("Error al realizar la solicitud:", error);
    });
}
