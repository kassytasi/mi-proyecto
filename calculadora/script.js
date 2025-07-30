const resultado = document.getElementById("resultado");
const n1 = document.getElementById("num1");
const n2 = document.getElementById("num2");
const calcularBtn = document.getElementById("calcular");

calcularBtn.addEventListener("click", () => {
    const val1 = parseFloat(n1.value);
    const val2 = parseFloat(n2.value);
    const operacion = document.querySelector('input[name="operacion"]:checked');

    // Validar números
    if (isNaN(val1) || isNaN(val2)) {
        resultado.textContent = "Introduce números válidos";
        resultado.classList.add("error");
        return;
    }

    // Validar operación seleccionada
    if (!operacion) {
        resultado.textContent = "Selecciona una operación";
        resultado.classList.add("error");
        return;
    }

    const op = operacion.value;
    let res;

    switch (op) {
        case "sumar":
            res = val1 + val2;
            break;
        case "restar":
            res = val1 - val2;
            break;
        case "multiplicar":
            res = val1 * val2;
            break;
        case "dividir":
            if (val2 === 0) {
                resultado.textContent = "❌ No se puede dividir entre 0";
                resultado.classList.add("error");
                return;
            }
            res = val1 / val2;
            break;
        default:
            resultado.textContent = "Operación no válida";
            resultado.classList.add("error");
            return;
    }

    // Mostrar resultado
    resultado.textContent = res;
    resultado.classList.remove("error");
});





